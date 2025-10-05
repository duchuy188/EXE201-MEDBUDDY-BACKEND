const NotificationToken = require('../models/NotificationToken');
const NotificationHistory = require('../models/NotificationHistory');
const { sendNotification } = require('../services/fcmService');

// Lưu token thiết bị (hỗ trợ nhiều thiết bị)
exports.saveToken = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { deviceToken } = req.body;
    if (!deviceToken) return res.status(400).json({ message: 'Thiếu deviceToken' });
    // Lưu mỗi token là một document, không ghi đè token cũ
    let tokenDoc = await NotificationToken.findOneAndUpdate(
      { userId, deviceToken },
      { userId, deviceToken },
      { upsert: true, new: true }
    );
    res.status(201).json(tokenDoc);
  } catch (err) {
    res.status(400).json({ message: 'Không thể lưu token', error: err.message });
  }
};

// Gửi thông báo nhắc uống thuốc (gửi đến tất cả thiết bị của user)
exports.sendNotification = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { title, body, sound } = req.body;
    // sound: tên file mp3, ví dụ "banmai.mp3"; nếu không có thì dùng "default"
    const soundFile = sound || "default";
    const tokenDocs = await NotificationToken.find({ userId });
    if (!tokenDocs || tokenDocs.length === 0) return res.status(404).json({ message: 'Không tìm thấy device token' });
    // Gửi đến tất cả token
    for (const tokenDoc of tokenDocs) {
      await sendNotification(tokenDoc.deviceToken, title, body, soundFile);
      await NotificationHistory.create({
        userId,
        title,
        body,
        deviceToken: tokenDoc.deviceToken,
        sentAt: new Date(),
        sound: soundFile
      });
    }
    res.json({ message: 'Đã gửi thông báo' });
  } catch (err) {
    res.status(400).json({ message: 'Không thể gửi thông báo', error: err.message });
  }
};
// Xóa token khi logout
exports.deleteToken = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { deviceToken } = req.body;
    if (!deviceToken) return res.status(400).json({ message: 'Thiếu deviceToken' });
    await NotificationToken.deleteOne({ userId, deviceToken });
    res.json({ message: 'Đã xóa token' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa token' });
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
