const Medication = require('../models/Medication');
const MedicationHistory = require('../models/MedicationHistory');
const { sendNotification } = require('./fcmService');
const NotificationToken = require('../models/NotificationToken');
const NotificationHistory = require('../models/NotificationHistory');
const mongoose = require('mongoose');

class MedicationQuantityService {
  
  // Cập nhật số lượng khi uống thuốc
  static async updateQuantityAfterTaking(medicationId, dosage) {
    try {
      const medication = await Medication.findById(medicationId);
      if (!medication) {
        throw new Error('Không tìm thấy thuốc');
      }

      // Parse dosage để lấy số viên uống (ví dụ: "2 viên" -> 2)
      const dosageNumber = this.parseDosageToNumber(dosage);
      
      // Trừ số lượng
      const newRemainingQuantity = Math.max(0, medication.remainingQuantity - dosageNumber);
      const wasLowStock = medication.isLowStock; // Lưu trạng thái cũ
      const isNowLowStock = newRemainingQuantity <= medication.lowStockThreshold;
      
      // Cập nhật số lượng còn lại
      await Medication.findByIdAndUpdate(medicationId, {
        remainingQuantity: newRemainingQuantity,
        // KHÔNG set isLowStock để cron job có thể detect
        // isLowStock: isNowLowStock
      });

      // Gửi thông báo chỉ khi chuyển từ không low stock sang low stock
      if (isNowLowStock && !wasLowStock) {
        // TẮT REAL-TIME - CHỈ DÙNG CRON JOB
        console.log(`[REAL-TIME] Thuốc ${medication.name} sắp hết (${newRemainingQuantity} viên) - CHỜ CRON JOB THÔNG BÁO`);
        
        // KHÔNG gửi notification ngay
        // medication.remainingQuantity = newRemainingQuantity;
        // await this.sendLowStockNotification(medication);
      }

      return { success: true, remainingQuantity: newRemainingQuantity };
    } catch (error) {
      console.error('Lỗi cập nhật số lượng thuốc:', error);
      throw error;
    }
  }

  // Thêm thuốc mới (mua thêm)
  static async addMedicationStock(medicationId, addedQuantity) {
    try {
      const medication = await Medication.findById(medicationId);
      if (!medication) {
        throw new Error('Không tìm thấy thuốc');
      }

      const newRemainingQuantity = medication.remainingQuantity + addedQuantity;
      const newTotalQuantity = medication.totalQuantity + addedQuantity;

      await Medication.findByIdAndUpdate(medicationId, {
        remainingQuantity: newRemainingQuantity,
        totalQuantity: newTotalQuantity,
        isLowStock: false, // Reset trạng thái cảnh báo
        lastRefillDate: new Date()
      });

      return { 
        success: true, 
        remainingQuantity: newRemainingQuantity,
        totalQuantity: newTotalQuantity 
      };
    } catch (error) {
      console.error('Lỗi thêm thuốc:', error);
      throw error;
    }
  }

  // Gửi thông báo sắp hết thuốc
  static async sendLowStockNotification(medication) {
    try {
      // Gửi thông báo cho bệnh nhân
      const patientTokens = await NotificationToken.find({ userId: medication.userId });
      
      for (const tokenDoc of patientTokens) {
        await sendNotification(
          String(tokenDoc.deviceToken),
          'Cảnh báo: Sắp hết thuốc',
          `Thuốc "${medication.name}" chỉ còn ${medication.remainingQuantity} viên. Bạn cần mua thêm sớm!`,
          'default'
        );

        await NotificationHistory.create({
          userId: medication.userId,
          title: 'Cảnh báo: Sắp hết thuốc',
          body: `Thuốc "${medication.name}" chỉ còn ${medication.remainingQuantity} viên. Bạn cần mua thêm sớm!`,
          deviceToken: tokenDoc.deviceToken,
          sentAt: new Date(),
          sound: 'default'
        });
      }

      // Gửi thông báo cho người thân (nếu có)
      const RelativePatient = require('../models/RelativePatient');
      const User = require('../models/User');
      const relationships = await RelativePatient.find({
        patient: medication.userId,
        status: 'accepted',
        permissions: { $in: ['manage_health_data', 'schedule_medication'] }
      }).populate('relative').populate('patient');

      for (const relationship of relationships) {
        const relativeTokens = await NotificationToken.find({ userId: relationship.relative._id });
        
        // Lấy tên bệnh nhân để hiển thị đúng trong thông báo
        const patientName = relationship.patient ? relationship.patient.fullName : 'bệnh nhân';
        
        for (const tokenDoc of relativeTokens) {
          await sendNotification(
            String(tokenDoc.deviceToken),
            'Cảnh báo: Thuốc sắp hết',
            `Thuốc "${medication.name}" của ${patientName} chỉ còn ${medication.remainingQuantity} viên. Cần mua thêm sớm!`,
            'default'
          );

          await NotificationHistory.create({
            userId: relationship.relative._id,
            title: 'Cảnh báo: Thuốc sắp hết',
            body: `Thuốc "${medication.name}" của ${patientName} chỉ còn ${medication.remainingQuantity} viên. Cần mua thêm sớm!`,
            deviceToken: tokenDoc.deviceToken,
            sentAt: new Date(),
            sound: 'default'
          });
        }
      }

      console.log(`Đã gửi thông báo sắp hết thuốc cho ${medication.name} (bệnh nhân + người thân)`);
    } catch (error) {
      console.error('Lỗi gửi thông báo sắp hết thuốc:', error);
    }
  }

  // Parse dosage string thành số
  static parseDosageToNumber(dosage) {
    if (!dosage) return 1;
    
    // Tìm số trong chuỗi (ví dụ: "2 viên", "1 viên", "3")
    const match = dosage.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  // Lấy danh sách thuốc sắp hết
  static async getLowStockMedications(userId) {
    try {
      if (!userId) {
        throw new Error('userId không được để trống');
      }

      console.log('=== DEBUG getLowStockMedications ===');
      console.log('Input userId:', userId);
      console.log('userId type:', typeof userId);

      // Convert string to ObjectId if needed
      const objectUserId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
      
      console.log('Converted userId:', objectUserId);

      // Lấy tất cả thuốc của user
      const allMedications = await Medication.find({ userId: objectUserId });
      console.log('Tổng số thuốc found:', allMedications.length);
      console.log('Sample medications:', allMedications.slice(0, 2).map(m => ({
        name: m.name,
        userId: m.userId,
        remaining: m.remainingQuantity,
        threshold: m.lowStockThreshold
      })));

      // Lọc thuốc sắp hết
      const lowStockMedications = allMedications.filter(med => {
        const isLowStock = med.remainingQuantity <= med.lowStockThreshold;
        console.log(`Thuốc ${med.name}: remaining=${med.remainingQuantity}, threshold=${med.lowStockThreshold}, isLow=${isLowStock}`);
        return isLowStock;
      });

      console.log('Số thuốc sắp hết:', lowStockMedications.length);
      console.log('=== END DEBUG ===');
      return lowStockMedications;
    } catch (error) {
      console.error('Lỗi lấy danh sách thuốc sắp hết:', error);
      throw error;
    }
  }

  // Khởi tạo số lượng cho thuốc mới
  static async initializeQuantity(medicationId, totalQuantity, lowStockThreshold = 5) {
    try {
      const medication = await Medication.findByIdAndUpdate(medicationId, {
        totalQuantity: totalQuantity,
        remainingQuantity: totalQuantity,
        lowStockThreshold: lowStockThreshold,
        isLowStock: false
      });

      return medication;
    } catch (error) {
      console.error('Lỗi khởi tạo số lượng thuốc:', error);
      throw error;
    }
  }

  // Cập nhật ngưỡng cảnh báo
  static async updateLowStockThreshold(medicationId, newThreshold) {
    try {
      const medication = await Medication.findByIdAndUpdate(medicationId, {
        lowStockThreshold: newThreshold,
        isLowStock: false // Reset trạng thái cảnh báo
      }, { new: true });

      return medication;
    } catch (error) {
      console.error('Lỗi cập nhật ngưỡng cảnh báo:', error);
      throw error;
    }
  }
}

module.exports = MedicationQuantityService;
