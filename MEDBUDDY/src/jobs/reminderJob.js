const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const fcmService = require('../services/fcmService');

// Cron job chạy mỗi phút
cron.schedule('* * * * *', async () => {
  try {
  const now = new Date();
  // Lấy ngày hiện tại theo local time (YYYY-MM-DD)
  const currentDate = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0');
  // Lấy giờ phút hiện tại theo local time (HH:mm)
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    console.log(`[JOB] Đang kiểm tra reminders tại ${currentDate} ${currentTime}`);

    // Tìm các nhắc nhở đúng ngày và giờ
    const reminders = await Reminder.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      time: currentTime,
      isActive: true,
    }).populate('userId');
    console.log(`[JOB] reminders tìm được:`, reminders.map(r => ({ _id: r._id, userId: r.userId._id, time: r.time, startDate: r.startDate, endDate: r.endDate, isActive: r.isActive, status: r.status })));

    // Gửi thông báo cho từng nhắc nhở
    for (const reminder of reminders) {
      // Lấy tất cả deviceToken của user
      const tokens = await require('../models/NotificationToken').find({ userId: reminder.userId._id });
      const NotificationHistory = require('../models/NotificationHistory');
      for (const tokenDoc of tokens) {
        console.log('Gửi FCM với token:', tokenDoc.deviceToken);
        await fcmService.sendNotification(
          String(tokenDoc.deviceToken),
          'Nhắc uống thuốc',
          `Đã đến giờ uống thuốc: ${reminder.note || 'Không có ghi chú'}`,
          reminder.reminderType === 'voice' ? `${reminder.voice}.mp3` : 'default'
        );
        await NotificationHistory.create({
          userId: reminder.userId._id,
          title: 'Nhắc uống thuốc',
          body: `Đã đến giờ uống thuốc: ${reminder.note || 'Không có ghi chú'}`,
          deviceToken: tokenDoc.deviceToken,
          sentAt: new Date(),
          sound: reminder.reminderType === 'voice' ? `${reminder.voice}.mp3` : 'default'
        });
        console.log(`[REMINDER] Đã gửi thông báo cho userId: ${reminder.userId._id} - deviceToken: ${tokenDoc.deviceToken} - sound: ${reminder.reminderType === 'voice' ? `${reminder.voice}.mp3` : 'default'}`);
      }
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
          reminder.reminderType === 'voice' ? `${reminder.voice}.mp3` : 'default'
        );
        console.log(`[REMINDER-SNOOZE] Đã gửi thông báo cho userId: ${reminder.userId._id} - deviceToken: ${tokenDoc.deviceToken} - sound: ${reminder.reminderType === 'voice' ? `${reminder.voice}.mp3` : 'default'}`);
      }
      // Cập nhật trạng thái nhắc nhở về `pending` sau khi gửi thông báo
      reminder.status = 'pending';
      reminder.snoozeTime = null;
      await reminder.save();
    }
  } catch (err) {
    console.error('Lỗi khi gửi thông báo:', err.message);
  }
});
