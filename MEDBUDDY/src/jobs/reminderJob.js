const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const MedicationHistory = require('../models/MedicationHistory');
const { createSafeMedicationHistory } = require('../services/medicationHistorySafe.service');
const fcmService = require('../services/fcmService');

// Job chạy mỗi phút
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Use server local date to avoid UTC vs local timezone mismatch
    const currentDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-'); // YYYY-MM-DD in server local timezone
    const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    // Detailed log: include both local and ISO strings so timezone issues are visible in logs
    console.log(`[JOB] Kiểm tra lúc ${currentDate} ${currentTime} (server local) - now=${now.toString()} - iso=${now.toISOString()}`);

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
          await createSafeMedicationHistory({
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

    // --- Gửi thông báo cho Appointment (tái khám) ---
    try {
      const Appointment = require('../models/Appointment');
      const appointments = await Appointment.find({
        status: 'pending',
        userId: { $exists: true },
        $expr: {
          $and: [
            { $eq: [{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }, currentDate] },
            { $eq: ["$time", currentTime] }
          ]
        }
      }).populate('userId');

      console.log(`[JOB] appointments tìm được: ${appointments.length}`);

      for (const appointment of appointments) {
        const tokens = await require('../models/NotificationToken').find({ userId: appointment.userId._id });
        if (!tokens.length) {
          console.log('[JOB] No notification tokens for appointment user', appointment.userId._id);
        }
        for (const tokenDoc of tokens) {
          try {
            await fcmService.sendNotification(
              String(tokenDoc.deviceToken),
              'Lịch hẹn tái khám',
              appointment.notes || 'Đã đến lịch tái khám'
            );
          } catch (err) {
            console.error('[JOB] Error sending appointment notification to token', tokenDoc.deviceToken, err.message || err);
          }
        }
        appointment.status = 'notified';
        await appointment.save();
      }
    } catch (err) {
      console.error('[JOB] Error processing appointments:', err.message || err);
    }

    // --- Xử lý nhắc đo huyết áp ---
    try {
      const BloodPressureReminder = require('../models/BloodPressureReminder');
      const bpReminders = await BloodPressureReminder.find({ isActive: true }).populate('userId');
      const bpRemindersToSend = bpReminders.filter(reminder =>
        Array.isArray(reminder.times) &&
        reminder.times.some(t => t.time === currentTime)
      );

      console.log(`[JOB] bloodPressureReminders to send: ${bpRemindersToSend.length}`);

      for (const reminder of bpRemindersToSend) {
        const tokens = await require('../models/NotificationToken').find({ userId: reminder.userId._id });
        if (!tokens.length) console.log('[JOB] No notification tokens for bp reminder user', reminder.userId._id);
        for (const tokenDoc of tokens) {
          try {
            await fcmService.sendNotification(
              String(tokenDoc.deviceToken),
              'Nhắc đo huyết áp',
              reminder.note || 'Đã đến giờ đo huyết áp!'
            );
          } catch (err) {
            console.error('[JOB] Error sending BP reminder to token', tokenDoc.deviceToken, err.message || err);
          }
        }
      }
    } catch (err) {
      console.error('[JOB] Error processing blood pressure reminders:', err.message || err);
    }

  } catch (err) {
    console.error('[JOB] Lỗi:', err.message);
  }
});