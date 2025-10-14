const cron = require('node-cron');
const Medication = require('../models/Medication');
const MedicationQuantityService = require('../services/medicationQuantity.service');
const mongoose = require('mongoose');

// Job chạy mỗi 10 phút để kiểm tra thuốc sắp hết
const medicationStockJob = cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date();
    const vnTime = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    console.log(`[STOCK-JOB] Bắt đầu kiểm tra thuốc sắp hết... Giờ VN: ${vnTime}`);
    
    // Thời gian 12 tiếng trước
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    // Lấy thuốc sắp hết: LẦN ĐẦU hoặc ĐÃ QUA 12 TIẾNG kể từ lần báo cuối
    const lowStockMedications = await Medication.find({
      $expr: { $lte: ['$remainingQuantity', '$lowStockThreshold'] },
      remainingQuantity: { $gt: 0 }, // Chỉ cảnh báo khi còn thuốc
      $or: [
        { isLowStock: false }, // Lần đầu tiên
        { 
          isLowStock: true,
          $or: [
            { lastNotificationDate: { $exists: false } }, // Chưa có field này
            { lastNotificationDate: { $lt: twelveHoursAgo } } // Đã quá 12 tiếng
          ]
        }
      ]
    }).populate('userId');

    console.log(`[STOCK-JOB] Tìm thấy ${lowStockMedications.length} thuốc cần thông báo`);

    // Gửi thông báo cho từng thuốc
    for (const medication of lowStockMedications) {
      try {
        await MedicationQuantityService.sendLowStockNotification(medication);
        
        // Đánh dấu đã cảnh báo và cập nhật thời gian báo cuối
        await Medication.findByIdAndUpdate(medication._id, { 
          isLowStock: true,
          lastNotificationDate: new Date()
        });
        
        const isRepeat = medication.lastNotificationDate ? "(lặp lại) " : "";
        console.log(`[STOCK-JOB] Đã gửi thông báo ${isRepeat}cho thuốc: ${medication.name} (${medication.remainingQuantity}/${medication.totalQuantity} viên)`);
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
    
    // Thời gian 12 tiếng trước
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    
    // Lấy thuốc đã hết: LẦN ĐẦU hoặc ĐÃ QUA 12 TIẾNG
    const outOfStockMedications = await Medication.find({
      remainingQuantity: 0,
      $or: [
        { isLowStock: false }, // Lần đầu
        { 
          isLowStock: true,
          $or: [
            { lastNotificationDate: { $exists: false } },
            { lastNotificationDate: { $lt: twelveHoursAgo } }
          ]
        }
      ]
    }).populate('userId');

    console.log(`[OUT-OF-STOCK-JOB] Tìm thấy ${outOfStockMedications.length} thuốc đã hết cần thông báo`);

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
        
        // Đánh dấu đã cảnh báo và cập nhật thời gian
        await Medication.findByIdAndUpdate(medication._id, { 
          isLowStock: true,
          lastNotificationDate: new Date()
        });
        
        const isRepeat = medication.lastNotificationDate ? "(lặp lại) " : "";
        console.log(`[OUT-OF-STOCK-JOB] Đã gửi thông báo ${isRepeat}hết thuốc cho: ${medication.name}`);
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
console.log('[STOCK-JOBS] ⏰ Low stock check: Every 10 minutes (Vietnam timezone)');
console.log('[STOCK-JOBS] ⏰ Out of stock check: Daily at 6:00 PM (Vietnam timezone)');
console.log('[STOCK-JOBS] 🔄 Repeat notifications: Every 12 hours for persistent low stock');
