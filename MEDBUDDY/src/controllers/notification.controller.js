const NotificationToken = require('../models/NotificationToken');
const NotificationHistory = require('../models/NotificationHistory');
const { sendNotification } = require('../services/fcmService');

// Lưu token thiết bị
exports.saveToken = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { deviceToken } = req.body;
    if (!deviceToken) return res.status(400).json({ message: 'Thiếu deviceToken' });
    let tokenDoc = await NotificationToken.findOneAndUpdate(
      { userId },
      { deviceToken },
      { upsert: true, new: true }
    );
    res.status(201).json(tokenDoc);
  } catch (err) {
    res.status(400).json({ message: 'Không thể lưu token', error: err.message });
  }
};

// Gửi thông báo nhắc uống thuốc
exports.sendNotification = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { title, body } = req.body;
    const tokenDoc = await NotificationToken.findOne({ userId });
    if (!tokenDoc) return res.status(404).json({ message: 'Không tìm thấy device token' });
    await sendNotification(tokenDoc.deviceToken, title, body);
    // Lưu lịch sử
    await NotificationHistory.create({ userId, title, body, deviceToken: tokenDoc.deviceToken });
    res.json({ message: 'Đã gửi thông báo' });
  } catch (err) {
    res.status(400).json({ message: 'Không thể gửi thông báo', error: err.message });
  }
};

// Lịch sử thông báo đã gửi
exports.getNotificationHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const history = await NotificationHistory.find({ userId }).sort({ sentAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
