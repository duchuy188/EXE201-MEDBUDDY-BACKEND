const BloodPressure = require('../models/BloodPressure');

// Ghi nhận chỉ số huyết áp
exports.createBloodPressure = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { systolic, diastolic, pulse, measuredAt, note } = req.body;
    const bp = new BloodPressure({ userId, systolic, diastolic, pulse, measuredAt, note });
    await bp.save();
    res.status(201).json(bp);
  } catch (err) {
    res.status(400).json({ message: 'Không thể ghi nhận huyết áp', error: err.message });
  }
};

// Lấy lịch sử huyết áp
exports.getBloodPressures = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const list = await BloodPressure.find({ userId }).sort({ measuredAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy lần đo mới nhất
exports.getLatestBloodPressure = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const latest = await BloodPressure.findOne({ userId }).sort({ measuredAt: -1 });
    if (!latest) return res.status(404).json({ message: 'Không có dữ liệu' });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa lần đo
exports.deleteBloodPressure = async (req, res) => {
  try {
    const bp = await BloodPressure.findByIdAndDelete(req.params.id);
    if (!bp) return res.status(404).json({ message: 'Không tìm thấy lần đo' });
    res.json({ message: 'Đã xóa lần đo' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
