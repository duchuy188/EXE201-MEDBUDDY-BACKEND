const Reminder = require('../models/Reminder');

// Lấy danh sách nhắc uống thuốc của user
exports.getReminders = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const reminders = await Reminder.find({ userId }).populate('medicationId');
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thêm nhắc uống thuốc
exports.createReminder = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { medicationId, time, repeat, note } = req.body;
    const reminder = new Reminder({ userId, medicationId, time, repeat, note });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ message: 'Không thể tạo nhắc nhở', error: err.message });
  }
};

// Xem chi tiết nhắc nhở
exports.getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id).populate('medicationId');
    if (!reminder) return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật nhắc nhở
exports.updateReminder = async (req, res) => {
  try {
    const { medicationId, time, repeat, note, isActive } = req.body;
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { medicationId, time, repeat, note, isActive },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ message: 'Không thể cập nhật nhắc nhở', error: err.message });
  }
};

// Xóa nhắc nhở
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    res.json({ message: 'Đã xóa nhắc nhở' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
