const cron = require('node-cron');
const Medication = require('../models/Medication');
const MedicationQuantityService = require('../services/medicationQuantity.service');
const mongoose = require('mongoose');

// Job chạy mỗi 2 tiếng để kiểm tra thuốc sắp hết
const medicationStockJob = cron.schedule('0 */2 * * *', async () => {
  try {
    console.log('[STOCK-JOB] Bắt đầu kiểm tra thuốc sắp hết...');
    
    // Lấy tất cả thuốc có số lượng <= ngưỡng cảnh báo và chưa được cảnh báo
    const lowStockMedications = await Medication.find({
      $expr: { $lte: ['$remainingQuantity', '$lowStockThreshold'] },
      isLowStock: false,
      remainingQuantity: { $gt: 0 } // Chỉ cảnh báo khi còn thuốc, không cảnh báo khi hết hoàn toàn
    }).populate('userId');

    console.log(`[STOCK-JOB] Tìm thấy ${lowStockMedications.length} thuốc sắp hết`);

    // Gửi thông báo cho từng thuốc
    for (const medication of lowStockMedications) {
      try {
        await MedicationQuantityService.sendLowStockNotification(medication);
        
        // Đánh dấu đã cảnh báo
        await Medication.findByIdAndUpdate(medication._id, { isLowStock: true });
        
        console.log(`[STOCK-JOB] Đã gửi thông báo cho thuốc: ${medication.name} (${medication.remainingQuantity}/${medication.totalQuantity} viên)`);
      } catch (error) {
        console.error(`[STOCK-JOB] Lỗi gửi thông báo cho thuốc ${medication.name}:`, error);
      }
    }

    console.log(`[STOCK-JOB] Đã gửi thông báo cho ${lowStockMedications.length} thuốc sắp hết`);
  } catch (error) {
    console.error('[STOCK-JOB] Lỗi kiểm tra thuốc sắp hết:', error);
  }
}, {
  scheduled: true, // Tự động chạy
  timezone: "Asia/Ho_Chi_Minh"
});

// Job kiểm tra thuốc đã hết hoàn toàn (chạy lúc 6h chiều)
const outOfStockJob = cron.schedule('0 18 * * *', async () => {
  try {
    console.log('[OUT-OF-STOCK-JOB] Bắt đầu kiểm tra thuốc đã hết...');
    
    // Lấy tất cả thuốc đã hết hoàn toàn
    const outOfStockMedications = await Medication.find({
      remainingQuantity: 0,
      isLowStock: false
    }).populate('userId');

    console.log(`[OUT-OF-STOCK-JOB] Tìm thấy ${outOfStockMedications.length} thuốc đã hết`);

    // Gửi thông báo cho từng thuốc
    for (const medication of outOfStockMedications) {
      try {
        const tokens = await require('../models/NotificationToken').find({ userId: medication.userId._id });
        const NotificationHistory = require('../models/NotificationHistory');
        const { sendNotification } = require('../services/fcmService');
        
        for (const tokenDoc of tokens) {
          await sendNotification(
            String(tokenDoc.deviceToken),
            'Cảnh báo: Đã hết thuốc',
            `Thuốc "${medication.name}" đã hết hoàn toàn! Vui lòng mua thêm ngay!`,
            'default'
          );

          await NotificationHistory.create({
            userId: medication.userId._id,
            title: 'Cảnh báo: Đã hết thuốc',
            body: `Thuốc "${medication.name}" đã hết hoàn toàn! Vui lòng mua thêm ngay!`,
            deviceToken: tokenDoc.deviceToken,
            sentAt: new Date(),
            sound: 'default'
          });
        }
        
        // Đánh dấu đã cảnh báo
        await Medication.findByIdAndUpdate(medication._id, { isLowStock: true });
        
        console.log(`[OUT-OF-STOCK-JOB] Đã gửi thông báo hết thuốc cho: ${medication.name}`);
      } catch (error) {
        console.error(`[OUT-OF-STOCK-JOB] Lỗi gửi thông báo cho thuốc ${medication.name}:`, error);
      }
    }

    console.log(`[OUT-OF-STOCK-JOB] Đã gửi thông báo cho ${outOfStockMedications.length} thuốc đã hết`);
  } catch (error) {
    console.error('[OUT-OF-STOCK-JOB] Lỗi kiểm tra thuốc đã hết:', error);
  }
}, {
  scheduled: true, // Tự động chạy
  timezone: "Asia/Ho_Chi_Minh"
});

// Jobs tự động chạy khi được import
console.log('[STOCK-JOBS] 🔔 Medication stock notification jobs started!');
console.log('[STOCK-JOBS] ⏰ Low stock check: Every 2 hours');
console.log('[STOCK-JOBS] ⏰ Out of stock check: Daily at 6:00 PM');
