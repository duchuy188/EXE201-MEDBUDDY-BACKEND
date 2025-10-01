const Reminder = require('../models/Reminder');
const TextToSpeechService = require('../services/textToSpeech.service');

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
    const { medicationId, times, startDate, endDate, reminderType, repeatTimes, note, voice, status, snoozeTime } = req.body;
    // Validate required fields
    if (!medicationId || !Array.isArray(times) || times.length === 0 || !startDate || !endDate || !reminderType) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc',
        error: 'Missing required fields: medicationId, times, startDate, endDate, reminderType'
      });
    }

    // Kiểm tra trùng lịch nhắc thuốc
    const userIdChecked = req.user._id;
    const existedReminder = await Reminder.findOne({
      userId: userIdChecked,
      medicationId,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ]
    });
    if (existedReminder) {
      return res.status(409).json({
        message: 'Đã tồn tại lịch nhắc thuốc cho thuốc này trong khoảng thời gian này',
        error: 'Duplicate reminder for this medication in the selected time range'
      });
    }

    // Validate reminderType
    if (!['normal', 'voice'].includes(reminderType)) {
      return res.status(400).json({
        message: 'Loại nhắc nhở không hợp lệ',
        error: 'reminderType must be either "normal" or "voice"'
      });
    }

    // Validate times array
    const validTimes = ['Sáng', 'Chiều', 'Tối'];
    for (const t of times) {
      if (!t.time || !validTimes.includes(t.time)) {
        return res.status(400).json({
          message: 'Thời gian uống thuốc không hợp lệ',
          error: 'Each times item must have a valid time: Sáng, Chiều, Tối'
        });
      }
    }

    // Validate voice
    const validVoices = ['banmai', 'lannhi', 'leminh', 'myan', 'thuminh', 'giahuy', 'linhsan'];
    let reminderVoice = null;
    if (reminderType === 'voice') {
      reminderVoice = voice && validVoices.includes(voice) ? voice : 'banmai';
    }

    // Validate repeatTimes array
    let repeatTimesArr = Array.isArray(repeatTimes) ? repeatTimes : [];
    repeatTimesArr = repeatTimesArr.map(rt => ({
      time: rt.time,
      taken: typeof rt.taken === 'boolean' ? rt.taken : false
    }));

    // Validate status
    const validStatus = ['pending', 'completed', 'snoozed'];
    const reminderStatus = validStatus.includes(status) ? status : 'pending';

    const userId = req.user._id;
    const reminderNote = note || "Đã đến giờ uống thuốc rồi";

    const reminder = new Reminder({
      userId,
      medicationId,
      times,
      startDate,
      endDate,
      reminderType,
      repeatTimes: repeatTimesArr,
      note: reminderNote,
      voice: reminderVoice,
      isActive: true,
      status: reminderStatus,
      snoozeTime: snoozeTime || null
    });
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
    const { medicationId, times, repeatDays, repeatTimes, note, startDate, endDate, isActive, reminderType, voice, status, snoozeTime } = req.body;
    const currentReminder = await Reminder.findById(req.params.id);
    if (!currentReminder) {
      return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    }

    const updateData = {
      medicationId,
      times,
      repeatDays,
      repeatTimes,
      note,
      startDate,
      endDate,
      isActive,
      reminderType,
      voice,
      status,
      snoozeTime
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const reminder = await Reminder.findByIdAndUpdate(
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
