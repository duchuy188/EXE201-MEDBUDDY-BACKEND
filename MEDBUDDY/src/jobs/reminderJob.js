const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const MedicationHistory = require('../models/MedicationHistory');
const fcmService = require('../services/fcmService');

// Job chạy mỗi phút
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    console.log(`[JOB] Kiểm tra lúc ${currentDate} ${currentTime}`);

    // BƯỚC 1: Tìm tất cả reminders đang active
    const reminders = await Reminder.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      isActive: true,
    }).populate('userId');

    // BƯỚC 2: Tạo MedicationHistory cho ngày hôm nay (nếu chưa có)
    for (const reminder of reminders) {
      for (const repeatTime of reminder.repeatTimes) {
        const existingHistory = await MedicationHistory.findOne({
          reminderId: reminder._id,
          date: currentDate,
          time: repeatTime.time
        });

        if (!existingHistory) {
          await MedicationHistory.create({
            userId: reminder.userId,
            medicationId: reminder.medicationId,
            reminderId: reminder._id,
            date: currentDate,
            time: repeatTime.time,
            taken: false,
            status: 'pending'
          });
          console.log(`[JOB] Tạo history mới: ${currentDate} ${repeatTime.time}`);
        }
      }
    }

    // BƯỚC 3: Đánh dấu MISSED cho những ngày đã qua mà vẫn PENDING
    await MedicationHistory.updateMany(
      {
        date: { $lt: currentDate },  // Chỉ những ngày trước hôm nay
        status: 'pending'
      },
      {
        $set: { status: 'missed' }
      }
    );

    // BƯỚC 4: Gửi thông báo cho những lần uống đúng giờ hiện tại
    const historiesToNotify = await MedicationHistory.find({
      date: currentDate,
      time: currentTime,
      status: 'pending'
    }).populate(['reminderId', 'medicationId', 'userId']);

    // BƯỚC 5: Kiểm tra và gửi thông báo cho snooze
    const snoozeHistories = await MedicationHistory.find({
      status: 'snoozed',
      snoozeUntil: { $lte: now }  // Đã đến thời gian nhắc lại
    }).populate(['reminderId', 'medicationId', 'userId']);

    console.log(`[JOB] Tìm thấy ${historiesToNotify.length} lần uống cần nhắc và ${snoozeHistories.length} lần snooze cần nhắc lại`);

    // Xử lý thông báo thường
    for (const history of historiesToNotify) {
      const reminder = history.reminderId;
      if (!reminder || !reminder.userId) continue;

      // Gửi FCM notification
      const tokens = await require('../models/NotificationToken').find({ 
        userId: reminder.userId._id 
      });
      
      for (const tokenDoc of tokens) {
        await fcmService.sendNotification(
          String(tokenDoc.deviceToken),
          'Nhắc uống thuốc',
          `Đã đến giờ uống thuốc: ${reminder.note || 'Không có ghi chú'}`,
          reminder.reminderType === 'voice' ? reminder.voice : 'default'
        );
        console.log(`[JOB] Đã gửi thông báo cho ${reminder.userId._id} lúc ${currentTime}`);
      }
    }

    // Xử lý thông báo snooze
    for (const history of snoozeHistories) {
      const reminder = history.reminderId;
      if (!reminder || !reminder.userId) continue;

      // Set lại status về pending để có thể action tiếp
      history.status = 'pending';
      history.snoozeUntil = null;
      await history.save();

      // Gửi FCM notification với thông điệp snooze
      const tokens = await require('../models/NotificationToken').find({ 
        userId: reminder.userId._id 
      });
      
      for (const tokenDoc of tokens) {
        await fcmService.sendNotification(
          String(tokenDoc.deviceToken),
          'Nhắc uống thuốc (Hoãn)',
          `Nhắc lại: Đã đến giờ uống thuốc ${reminder.note || 'Không có ghi chú'} (Đã hoãn ${history.snoozeCount} lần)`,
          reminder.reminderType === 'voice' ? reminder.voice : 'default'
        );
        console.log(`[JOB] Đã gửi thông báo snooze cho ${reminder.userId._id}`);
      }
    }

  } catch (err) {
    console.error('[JOB] Lỗi:', err.message);
  }
});