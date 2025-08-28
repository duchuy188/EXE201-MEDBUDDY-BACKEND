const Reminder = require('../models/Reminder');

exports.updateReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, snoozeTime } = req.body;

    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    }

    reminder.status = status;
    if (status === 'snoozed' && snoozeTime) {
      reminder.snoozeTime = snoozeTime;
    }

    await reminder.save();
    res.status(200).json({ message: 'Trạng thái nhắc nhở đã được cập nhật', reminder });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
