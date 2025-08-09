const MedicationHistory = require('../models/MedicationHistory');

// POST /medications/history – Ghi nhận đã uống thuốc/đã bỏ quên
exports.createMedicationHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { medicationId, status, takenAt, note } = req.body;
    const history = new MedicationHistory({ userId, medicationId, status, takenAt, note });
    await history.save();
    res.status(201).json(history);
  } catch (err) {
    res.status(400).json({ message: 'Không thể ghi nhận lịch sử', error: err.message });
  }
};

// GET /medications/history – Xem lại lịch sử uống thuốc
exports.getMedicationHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const list = await MedicationHistory.find({ userId }).sort({ takenAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
