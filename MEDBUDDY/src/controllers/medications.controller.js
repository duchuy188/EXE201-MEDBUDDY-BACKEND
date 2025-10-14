// Lưu nhiều thuốc từ kết quả OCR
exports.createMedicationsFromOcr = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { medicines, imageUrl, rawText } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: 'Danh sách thuốc không hợp lệ' });
    }
    // Map từng thuốc sang schema Medication
    const docs = medicines.map(med => ({
      userId,
      name: med.name,
      form: med.form || '',
      image: imageUrl || '',
      note: med.usage || med.note || '',
      quantity: med.quantity || '', // tổng số lượng thuốc
      times: med.times || [] // mảng các buổi uống và liều lượng
      // Có thể lưu rawText vào note hoặc trường riêng nếu muốn
    }));
    const result = await require('../models/Medication').insertMany(docs);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: 'Không thể lưu danh sách thuốc', error: err.message });
  }
};
const Medication = require('../models/Medication');
const Reminder = require('../models/Reminder');
const MedicationHistory = require('../models/MedicationHistory');
const MedicationQuantityService = require('../services/medicationQuantity.service');

// Lấy danh sách thuốc của người dùng
exports.getMedications = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId; // tuỳ cách xác thực
    const medications = await Medication.find({ userId });
    res.json(medications);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thêm thuốc mới
exports.createMedication = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { name, form, image, note, times, quantity, totalQuantity, lowStockThreshold } = req.body;
    
    // Parse quantity nếu là string
    const parsedTotalQuantity = totalQuantity || parseInt(quantity) || 0;
    
    // Tự động tạo quantity string từ totalQuantity
    const quantityString = parsedTotalQuantity ? `${parsedTotalQuantity} viên` : (quantity || '');
    
    const medication = new Medication({ 
      userId, 
      name, 
      form, 
      image, 
      note, 
      times, 
      quantity: quantityString, // Tự động tạo từ totalQuantity
      totalQuantity: parsedTotalQuantity,
      remainingQuantity: parsedTotalQuantity,
      lowStockThreshold: lowStockThreshold || 5
    });
    
    await medication.save();
    res.status(201).json(medication);
  } catch (err) {
    res.status(400).json({ message: 'Không thể thêm thuốc', error: err.message });
  }
};

// Xem chi tiết thuốc
exports.getMedicationById = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) return res.status(404).json({ message: 'Không tìm thấy thuốc' });
    res.json(medication);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin thuốc (gộp: update info + add stock + update threshold)
exports.updateMedication = async (req, res) => {
  try {
    const { 
      // Thông tin cơ bản
      name, form, image, note, times, quantity,
      // Quản lý số lượng
      addedQuantity, lowStockThreshold 
    } = req.body;
    
    const medication = await Medication.findById(req.params.id);
    if (!medication) return res.status(404).json({ message: 'Không tìm thấy thuốc' });

    // 1. Cập nhật thông tin cơ bản (nếu có)
    const basicUpdates = {};
    if (name !== undefined) basicUpdates.name = name;
    if (form !== undefined) basicUpdates.form = form;
    if (image !== undefined) basicUpdates.image = image;
    if (note !== undefined) basicUpdates.note = note;
    if (times !== undefined) basicUpdates.times = times;
    if (quantity !== undefined) basicUpdates.quantity = quantity;

    // 2. Xử lý mua thêm thuốc (nếu có addedQuantity)
    if (addedQuantity && addedQuantity > 0) {
      basicUpdates.remainingQuantity = medication.remainingQuantity + addedQuantity;
      basicUpdates.totalQuantity = medication.totalQuantity + addedQuantity;
      basicUpdates.isLowStock = false; // Reset cảnh báo khi mua thêm
      basicUpdates.lastRefillDate = new Date();
    }

    // 3. Cập nhật ngưỡng cảnh báo (nếu có)
    if (lowStockThreshold !== undefined && lowStockThreshold >= 0) {
      basicUpdates.lowStockThreshold = lowStockThreshold;
      // Kiểm tra lại trạng thái low stock với ngưỡng mới
      const currentRemaining = basicUpdates.remainingQuantity || medication.remainingQuantity;
      basicUpdates.isLowStock = currentRemaining <= lowStockThreshold;
    }

    // 4. Thực hiện update
    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      basicUpdates,
      { new: true }
    );

    // 5. Tạo response thống nhất
    const response = {
      success: true,
      message: 'Cập nhật thuốc thành công',
      data: updatedMedication
    };

    // Thêm thông tin về việc mua thêm nếu có
    if (addedQuantity && addedQuantity > 0) {
      response.addedQuantity = addedQuantity;
      response.remainingQuantity = updatedMedication.remainingQuantity;
      response.totalQuantity = updatedMedication.totalQuantity;
    }

    res.json(response);
  } catch (err) {
    res.status(400).json({ message: 'Không thể cập nhật thuốc', error: err.message });
  }
};

// Xóa thuốc
exports.deleteMedication = async (req, res) => {
  try {
    const medicationId = req.params.id;
    
    // Kiểm tra thuốc có tồn tại không
    const medication = await Medication.findById(medicationId);
    if (!medication) return res.status(404).json({ message: 'Không tìm thấy thuốc' });
    
    // Xóa tất cả dữ liệu liên quan đến thuốc này
    await Promise.all([
      Reminder.deleteMany({ medicationId: medicationId }),
      MedicationHistory.deleteMany({ medicationId: medicationId })
    ]);
    
    // Xóa thuốc
    await Medication.findByIdAndDelete(medicationId);
    
    res.json({ 
      message: 'Đã xóa thuốc và tất cả dữ liệu liên quan',
      deletedMedicationId: medicationId
    });
  } catch (err) {
    console.error('Lỗi deleteMedication:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách thuốc sắp hết
exports.getLowStockMedications = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId' });
    }
    
    const medications = await MedicationQuantityService.getLowStockMedications(userId);
    res.json(medications);
  } catch (err) {
    console.error('Lỗi getLowStockMedications:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
