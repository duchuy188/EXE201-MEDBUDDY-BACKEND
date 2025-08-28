const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const fcmService = require('../services/fcmService');

// Cron job chạy mỗi phút
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // Lấy ngày hiện tại (YYYY-MM-DD)
    const currentTime = now.toISOString().slice(11, 16); // Lấy giờ phút hiện tại (HH:mm)

    // Tìm các nhắc nhở đúng ngày và giờ
    const reminders = await Reminder.find({
      date: currentDate,
      time: currentTime,
      isActive: true,
    }).populate('userId');

    // Gửi thông báo cho từng nhắc nhở
    for (const reminder of reminders) {
      const message = {
        title: 'Nhắc uống thuốc',
        body: `Đã đến giờ uống thuốc: ${reminder.note || 'Không có ghi chú'}`,
        token: reminder.userId.notificationToken, // Token của thiết bị người dùng
      };

      await fcmService.sendNotification(message);
    }

    // Kiểm tra và gửi lại thông báo cho các nhắc nhở đang trong trạng thái snoozed
    const snoozedReminders = await Reminder.find({
      status: 'snoozed',
      snoozeTime: { $lte: now },
      isActive: true,
    }).populate('userId');

    for (const reminder of snoozedReminders) {
      const message = {
        title: 'Nhắc uống thuốc',
        body: `Đã đến giờ uống thuốc: ${reminder.note || 'Không có ghi chú'}`,
        token: reminder.userId.notificationToken,
      };

      await fcmService.sendNotification(message);

      // Cập nhật trạng thái nhắc nhở về `pending` sau khi gửi thông báo
      reminder.status = 'pending';
      reminder.snoozeTime = null;
      await reminder.save();
    }
  } catch (err) {
    console.error('Lỗi khi gửi thông báo:', err.message);
  }
});
