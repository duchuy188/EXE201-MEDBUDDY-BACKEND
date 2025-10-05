const BloodPressureReminder = require('../models/BloodPressureReminder');

// Lấy danh sách nhắc đo huyết áp của user
exports.getBloodPressureReminders = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const reminders = await BloodPressureReminder.find({ userId });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo nhắc đo huyết áp
exports.createBloodPressureReminder = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { times, note, isActive } = req.body;
    if (!times || !Array.isArray(times) || times.length === 0) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc',
        error: 'Missing required fields: times'
      });
    }
    const reminder = new BloodPressureReminder({
      userId,
      times,
      note: note || 'Đã đến giờ đo huyết áp!',
      isActive: typeof isActive === 'boolean' ? isActive : true,
      status: 'pending'
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ message: 'Không thể tạo nhắc nhở', error: err.message });
  }
};

// Xem chi tiết nhắc đo huyết áp
exports.getBloodPressureReminderById = async (req, res) => {
  try {
    const reminder = await BloodPressureReminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật nhắc đo huyết áp
exports.updateBloodPressureReminder = async (req, res) => {
  try {
    const { times, note, isActive, status } = req.body;
    const updateData = {
      times,
      note,
      isActive,
      status
    };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    const reminder = await BloodPressureReminder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ message: 'Không thể cập nhật nhắc nhở', error: err.message });
  }
};

// Xóa nhắc đo huyết áp
exports.deleteBloodPressureReminder = async (req, res) => {
  try {
    const reminder = await BloodPressureReminder.findByIdAndDelete(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    res.json({ message: 'Đã xóa nhắc nhở' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
