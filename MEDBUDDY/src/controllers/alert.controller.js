const Alert = require('../models/Alert');

// GET /alerts – Danh sách cảnh báo
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /alerts/acknowledge – Xác nhận đã đọc cảnh báo
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.body;
    const alert = await Alert.findByIdAndUpdate(alertId, { isRead: true, readAt: new Date() }, { new: true });
    if (!alert) return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
    res.json({ message: 'Đã xác nhận cảnh báo', alert });
  } catch (err) {
    res.status(400).json({ message: 'Không thể xác nhận cảnh báo', error: err.message });
  }
};
