const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const fcmService = require('../services/fcmService');
const BloodPressureReminder = require('../models/BloodPressureReminder');

// Cron job chạy mỗi phút
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Lấy ngày hiện tại theo local time (YYYY-MM-DD)
    const currentDate = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0');
    // Lấy giờ phút hiện tại theo local time (HH:mm)
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    console.log(`[JOB] Đang kiểm tra reminders tại ${currentDate} ${currentTime}`);

    // Tìm các nhắc nhở đúng ngày
    const reminders = await Reminder.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      isActive: true,
    }).populate('userId');

    const MedicationHistory = require('../models/MedicationHistory');

    // Tạo MedicationHistory records cho ngày hôm nay nếu chưa có
    for (const reminder of reminders) {
      for (const rt of reminder.repeatTimes) {
        // Check if MedicationHistory already exists for today
        const existingHistory = await MedicationHistory.findOne({
          reminderId: reminder._id,
          date: currentDate,
          time: rt.time
        });

        if (!existingHistory) {
          // Create new MedicationHistory record for today
          await MedicationHistory.create({
            userId: reminder.userId,
            medicationId: reminder.medicationId,
            reminderId: reminder._id,
            date: currentDate,
            time: rt.time,
            taken: false,
            status: 'pending'
          });
          console.log(`[JOB] Created MedicationHistory for ${currentDate} ${rt.time}, reminder ${reminder._id}`);
        }
      }
    }

    // Mark missed doses for yesterday and earlier (chỉ đánh missed cho những ngày đã qua)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1).toString().padStart(2, '0') + '-' + yesterday.getDate().toString().padStart(2, '0');
    
    await MedicationHistory.updateMany(
      {
        date: { $lt: currentDate }, // Chỉ những ngày trước hôm nay
        status: 'pending'
      },
      {
        $set: { 
          status: 'missed',
          taken: false
        }
      }
    );

    // Lọc các reminder có lần uống đúng giờ hiện tại và chưa được xử lý
    const remindersToSend = [];
    for (const reminder of reminders) {
      for (const rt of reminder.repeatTimes) {
        // Check if should send notification
        let shouldSend = false;
        
        // Regular time notification
        if (rt.time === currentTime) {
          const history = await MedicationHistory.findOne({
            reminderId: reminder._id,
            date: currentDate,
            time: rt.time,
            status: 'pending'
          });
          if (history) shouldSend = true;
        }
        
        // Snooze notification
        if (rt.snoozeUntil && rt.snoozeUntil <= now) {
          const history = await MedicationHistory.findOne({
            reminderId: reminder._id,
            date: currentDate,
            time: rt.time,
            status: 'pending'
          });
          if (history) {
            shouldSend = true;
            // Clear snooze after notification
            rt.snoozeUntil = undefined;
            await reminder.save();
          }
        }
        
        if (shouldSend) {
          remindersToSend.push({ reminder, repeatTime: rt });
        }
      }
    }

    console.log(`[JOB] reminders tìm được:`, remindersToSend.length);

    // Gửi thông báo cho từng nhắc nhở
    for (const { reminder, repeatTime } of remindersToSend) {
      const tokens = await require('../models/NotificationToken').find({ userId: reminder.userId._id });
      const NotificationHistory = require('../models/NotificationHistory');
      for (const tokenDoc of tokens) {
        console.log('Gửi FCM với token:', tokenDoc.deviceToken);
        await fcmService.sendNotification(
          String(tokenDoc.deviceToken),
          'Nhắc uống thuốc',
          `Đã đến giờ uống thuốc: ${reminder.note || 'Không có ghi chú'}`,
          reminder.reminderType === 'voice' ? `${reminder.voice}` : 'default'
        );
        await NotificationHistory.create({
          userId: reminder.userId._id,
          title: 'Nhắc uống thuốc',
          body: `Đã đến giờ uống thuốc: ${reminder.note || 'Không có ghi chú'}`,
          deviceToken: tokenDoc.deviceToken,
          sentAt: new Date(),
          sound: reminder.reminderType === 'voice' ? `${reminder.voice}` : 'default'
        });
        console.log(`[REMINDER] Đã gửi thông báo cho userId: ${reminder.userId._id} - deviceToken: ${tokenDoc.deviceToken} - sound: ${reminder.reminderType === 'voice' ? `${reminder.voice}` : 'default'}`);
      }
    }

      // Update repeatTimes: if pending -> keep as pending until user action; but if the job sent the notification
      // we mark nothing here. For backward compatibility we can set a 'lastNotifiedAt' if needed. Leave per-dose status to controllers.
      // However, if a repeatTime was snoozed and snoozeUntil triggered, after sending we reset status to pending so user can act
      let updated = false;
      for (const rt of reminder.repeatTimes) {
        if (rt.time === currentTime && rt.status === 'snoozed' && rt.snoozeUntil && rt.snoozeUntil <= now) {
          rt.status = 'pending';
          rt.snoozeUntil = undefined;
          rt.statusDate = currentDate;
          updated = true;
        }
      }
      if (updated) await reminder.save();
    }

    // --- Thêm logic gửi FCM cho Appointment ---
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
    console.log(`[JOB] appointments tìm được:`, appointments.map(a => ({ _id: a._id, userId: a.userId._id, date: a.date, time: a.time, notes: a.notes })));

    for (const appointment of appointments) {
      const tokens = await require('../models/NotificationToken').find({ userId: appointment.userId._id });
      for (const tokenDoc of tokens) {
        console.log('Gửi FCM cho appointment với token:', tokenDoc.deviceToken);
        await fcmService.sendNotification(
          String(tokenDoc.deviceToken),
          'Lịch hẹn tái khám',
          appointment.notes || 'Đã đến lịch tái khám'
        );
        // Có thể lưu lịch sử gửi nếu cần
      }
      appointment.status = 'notified';
      await appointment.save();
    }

    // Kiểm tra các repeatTimes snoozed with snoozeUntil <= now (per-dose snooze)
    const snoozedReminders = await Reminder.find({
      'repeatTimes.status': 'snoozed',
      isActive: true,
    }).populate('userId');

    for (const reminder of snoozedReminders) {
      let updated = false;
      for (const rt of reminder.repeatTimes) {
        if (rt.status === 'snoozed' && rt.snoozeUntil && rt.snoozeUntil <= now && rt.statusDate === currentDate) {
          const tokens = await require('../models/NotificationToken').find({ userId: reminder.userId._id });
          for (const tokenDoc of tokens) {
            console.log('Gửi FCM (snoozed) với token:', tokenDoc.deviceToken);
            await fcmService.sendNotification(
              String(tokenDoc.deviceToken),
              'Nhắc uống thuốc',
              `Đã đến giờ uống thuốc: ${reminder.note || 'Không có ghi chú'}`,
              reminder.reminderType === 'voice' ? `${reminder.voice}` : 'default'
            );
            console.log(`[REMINDER-SNOOZE] Đã gửi thông báo cho userId: ${reminder.userId._id} - deviceToken: ${tokenDoc.deviceToken}`);
          }
          // After sending snooze notification, set status back to pending so user can act
          rt.status = 'pending';
          rt.snoozeUntil = undefined;
          updated = true;
        }
      }
      if (updated) await reminder.save();
    }

    // --- Xử lý nhắc đo huyết áp ---
    const bpReminders = await BloodPressureReminder.find({ isActive: true }).populate('userId');
    const bpRemindersToSend = bpReminders.filter(reminder =>
      Array.isArray(reminder.times) &&
      reminder.times.some(t => t.time === currentTime)
    );
    console.log(`[JOB] bloodPressureReminders tìm được:`, bpRemindersToSend.map(r => ({
      _id: r._id, userId: r.userId._id, times: r.times, isActive: r.isActive, status: r.status
    })));

    for (const reminder of bpRemindersToSend) {
      const tokens = await require('../models/NotificationToken').find({ userId: reminder.userId._id });
      for (const tokenDoc of tokens) {
        await fcmService.sendNotification(
          String(tokenDoc.deviceToken),
          'Nhắc đo huyết áp',
          reminder.note || 'Đã đến giờ đo huyết áp!'
        );
        // Có thể lưu lịch sử gửi nếu cần
      }
    }
  } catch (err) {
    console.error('Lỗi khi gửi thông báo:', err.message);
  }
});
