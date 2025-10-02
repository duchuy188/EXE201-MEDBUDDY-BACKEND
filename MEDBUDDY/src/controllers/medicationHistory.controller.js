const MedicationHistory = require('../models/MedicationHistory');

// Tạo lịch sử uống thuốc mới
exports.createHistory = async (req, res) => {
  try {
    const { userId, medicationId, reminderId, date, time, taken, takenAt, status } = req.body;
    const history = new MedicationHistory({
      userId,
      medicationId,
      reminderId,
      date,
      time,
      taken: taken || false,
      takenAt,
      status: status || 'missed',
    });
    await history.save();
    res.status(201).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy lịch sử uống thuốc theo user
exports.getHistoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const histories = await MedicationHistory.find({ userId });
    res.json(histories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật trạng thái uống thuốc
exports.updateHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { taken, takenAt, status } = req.body;
    const history = await MedicationHistory.findByIdAndUpdate(
      id,
      { taken, takenAt, status },
      { new: true }
    );
    if (!history) return res.status(404).json({ error: 'Not found' });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa lịch sử uống thuốc
exports.deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MedicationHistory.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
