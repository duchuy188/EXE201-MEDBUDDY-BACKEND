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

    // Tìm các nhắc nhở đúng ngày, có repeatTimes chứa giờ hiện tại
    const reminders = await Reminder.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      isActive: true,
    }).populate('userId');
    // Lọc các reminder có repeatTimes chứa currentTime
    const remindersToSend = reminders.filter(reminder =>
      Array.isArray(reminder.repeatTimes) &&
      reminder.repeatTimes.some(rt => rt.time === currentTime && rt.taken === false)
    );
    console.log(`[JOB] reminders tìm được:`, remindersToSend.map(r => ({ _id: r._id, userId: r.userId._id, repeatTimes: r.repeatTimes, startDate: r.startDate, endDate: r.endDate, isActive: r.isActive, status: r.status })));

    // Gửi thông báo cho từng nhắc nhở
    for (const reminder of remindersToSend) {
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
      // Đánh dấu repeatTimes.taken = true cho lần nhắc vừa gửi
      reminder.repeatTimes.forEach(rt => {
        if (rt.time === currentTime) rt.taken = true;
      });
      await reminder.save();
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

    // Kiểm tra và gửi lại thông báo cho các nhắc nhở đang trong trạng thái snoozed
    const snoozedReminders = await Reminder.find({
      status: 'snoozed',
      snoozeTime: { $lte: now },
      isActive: true,
    }).populate('userId');

    for (const reminder of snoozedReminders) {
      const tokens = await require('../models/NotificationToken').find({ userId: reminder.userId._id });
      for (const tokenDoc of tokens) {
        console.log('Gửi FCM với token:', tokenDoc.deviceToken);
        await fcmService.sendNotification(
          String(tokenDoc.deviceToken),
          'Nhắc uống thuốc',
          `Đã đến giờ uống thuốc: ${reminder.note || 'Không có ghi chú'}`,
          reminder.reminderType === 'voice' ? `${reminder.voice}` : 'default'
        );
        console.log(`[REMINDER-SNOOZE] Đã gửi thông báo cho userId: ${reminder.userId._id} - deviceToken: ${tokenDoc.deviceToken} - sound: ${reminder.reminderType === 'voice' ? `${reminder.voice}` : 'default'}`);
      }
      // Cập nhật trạng thái nhắc nhở về `pending` sau khi gửi thông báo
      reminder.status = 'pending';
      reminder.snoozeTime = null;
      await reminder.save();
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
