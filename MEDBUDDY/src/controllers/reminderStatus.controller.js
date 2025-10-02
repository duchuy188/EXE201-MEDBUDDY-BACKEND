const Reminder = require('../models/Reminder');
const MedicationHistory = require('../models/MedicationHistory');

exports.updateReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, snoozeTime } = req.body;

    // Chỉ cho phép các trạng thái hợp lệ
    const validStatuses = ['pending', 'completed', 'snoozed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ', error: 'Status must be pending, completed, or snoozed' });
    }

    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    }

    reminder.status = status;
    if (status === 'snoozed' && snoozeTime) {
      reminder.snoozeTime = snoozeTime;
    } else {
      reminder.snoozeTime = undefined;
    }

    // Nếu xác nhận completed, ghi nhận MedicationHistory cho các lần uống chưa được ghi nhận
    if (status === 'completed') {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      for (const repeat of reminder.repeatTimes) {
        if (!repeat.taken) {
          await MedicationHistory.create({
            userId: reminder.userId,
            medicationId: reminder.medicationId,
            reminderId: reminder._id,
            date: today,
            time: repeat.time,
            taken: true,
            takenAt: new Date(),
            status: 'on_time'
          });
          repeat.taken = true;
        }
      }
    }

    await reminder.save();
    res.status(200).json({ message: 'Trạng thái nhắc nhở đã được cập nhật', reminder });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
