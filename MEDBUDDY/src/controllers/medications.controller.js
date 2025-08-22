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
      dosage: med.quantity || med.dosage || '',
      form: med.form || '',
      image: imageUrl || '',
      note: med.usage || med.note || '',
      // Có thể lưu rawText vào note hoặc trường riêng nếu muốn
    }));
    const result = await require('../models/Medication').insertMany(docs);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: 'Không thể lưu danh sách thuốc', error: err.message });
  }
};
const Medication = require('../models/Medication');

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
    const { name, dosage, form, image, note, timeOfDay, time, expirationDate } = req.body;
    const medication = new Medication({ userId, name, dosage, form, image, note, timeOfDay, time, expirationDate });
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

// Cập nhật thông tin thuốc
exports.updateMedication = async (req, res) => {
  try {
    const { name, dosage, form, image, note, timeOfDay, time, expirationDate } = req.body;
    const medication = await Medication.findByIdAndUpdate(
      req.params.id,
      { name, dosage, form, image, note, timeOfDay, time, expirationDate },
      { new: true }
    );
    if (!medication) return res.status(404).json({ message: 'Không tìm thấy thuốc' });
    res.json(medication);
  } catch (err) {
    res.status(400).json({ message: 'Không thể cập nhật thuốc', error: err.message });
  }
};

// Xóa thuốc
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findByIdAndDelete(req.params.id);
    if (!medication) return res.status(404).json({ message: 'Không tìm thấy thuốc' });
    res.json({ message: 'Đã xóa thuốc' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
