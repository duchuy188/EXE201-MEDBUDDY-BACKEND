const Reminder = require('../models/Reminder');
const MedicationHistory = require('../models/MedicationHistory');
const { createSafeMedicationHistory } = require('../services/medicationHistorySafe.service');

// API để user thực hiện action: take/skip/snooze
exports.updateReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;           // ID của reminder
    const { action, time } = req.body;   // action: take/skip/snooze, time: "08:00"

    // Validate input
    if (!['take', 'skip', 'snooze'].includes(action)) {
      return res.status(400).json({ message: 'Action phải là: take, skip, hoặc snooze' });
    }
    if (!time) {
      return res.status(400).json({ message: 'Thiếu thông tin time (HH:mm)' });
    }

    // Tìm reminder
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    }

    // Kiểm tra time có tồn tại trong repeatTimes không
    const repeatTime = reminder.repeatTimes.find(rt => rt.time === time);
    if (!repeatTime) {
      return res.status(404).json({ message: 'Không tìm thấy thời gian này trong lịch nhắc' });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Tìm hoặc tạo MedicationHistory cho hôm nay
    let history = await MedicationHistory.findOne({
      reminderId: reminder._id,
      date: today,
      time: time
    });

    if (!history) {
      history = await createSafeMedicationHistory({
        userId: reminder.userId,
        medicationId: reminder.medicationId,
        reminderId: reminder._id,
        date: today,
        time: time,
        taken: false,
        status: 'pending'
      }) || null;
    }

    // Thực hiện action
    if (action === 'take') {
      history.status = 'taken';
      history.taken = true;
      history.takenAt = new Date();
      
    } else if (action === 'skip') {
      history.status = 'skipped';
      history.taken = false;
      history.takenAt = null;
      
    } else if (action === 'snooze') {
      // Snooze: để pending nhưng sẽ nhắc lại sau 5 phút
      // (Có thể implement logic snooze riêng nếu cần)
      history.status = 'pending';
    }

    await history.save();

    res.json({
      message: `Đã ${action === 'take' ? 'đánh dấu uống' : action === 'skip' ? 'bỏ qua' : 'hoãn'} lần uống ${time}`,
      history: {
        date: history.date,
        time: history.time,
        status: history.status,
        taken: history.taken,
        takenAt: history.takenAt
      }
    });

  } catch (err) {
    console.error('[API] Lỗi:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};