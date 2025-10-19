const Reminder = require('../models/Reminder');
const TextToSpeechService = require('../services/textToSpeech.service');
const Medication = require('../models/Medication');

// Helper: tạo câu nhắc mặc định từ reminder (sử dụng medicationId đã populate nếu có)
function generateReminderNote(reminder) {
  try {
    let medName = 'thuốc';
    let medForm = 'viên';
    let remaining = null;
    if (reminder.medicationId) {
      const med = reminder.medicationId;
      if (med.name) medName = med.name;
      if (med.form) medForm = med.form;
      if (typeof med.remainingQuantity !== 'undefined' && med.remainingQuantity !== null) remaining = med.remainingQuantity;
    }

    const defaultDose = 1;
    let timePhrase = '';
    if (Array.isArray(reminder.times) && reminder.times.length > 0) {
      const first = reminder.times[0].time || '';
      if (first === 'Sáng') timePhrase = 'buổi sáng';
      else if (first === 'Chiều') timePhrase = 'buổi chiều';
      else if (first === 'Tối') timePhrase = 'buổi tối';
      else timePhrase = first;
    }

    const doseText = `Vui lòng uống ${defaultDose} ${medForm}` + (timePhrase ? ` vào ${timePhrase}` : '') + '.';
    const remainingText = remaining !== null ? ` Hiện còn ${remaining} ${medForm}.` : '';
    return `Đã đến giờ uống thuốc ${medName}. ${doseText}${remainingText}`;
  } catch (e) {
    return 'Đã đến giờ uống thuốc.';
  }
}

// Lấy danh sách nhắc uống thuốc của user
exports.getReminders = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const reminders = await Reminder.find({ userId }).populate('medicationId');
    // Thay thế các note mặc định cũ bằng câu rõ ràng hơn khi trả về cho client
    const normalized = reminders.map(r => {
      const placeholder = !r.note || (typeof r.note === 'string' && r.note.trim() === 'Đã đến giờ uống thuốc rồi');
      if (placeholder) r.note = generateReminderNote(r);
      return r;
    });
    res.json(normalized);
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

    // Validate repeatTimes array and initialize per-dose status fields
    let repeatTimesArr = Array.isArray(repeatTimes) ? repeatTimes : [];
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    repeatTimesArr = repeatTimesArr.map(rt => ({
      time: rt.time,
      status: rt.status && ['pending', 'taken', 'skipped', 'snoozed', 'missed'].includes(rt.status) ? rt.status : 'pending',
      statusDate: rt.statusDate || today,
      snoozeUntil: rt.snoozeUntil ? new Date(rt.snoozeUntil) : undefined,
      takenAt: rt.takenAt ? new Date(rt.takenAt) : undefined
    }));

    // Validate status
    const validStatus = ['pending', 'completed', 'snoozed'];
    const reminderStatus = validStatus.includes(status) ? status : 'pending';

    const userId = req.user._id;
    // Nếu user không truyền note, tạo câu nhắc mặc định chi tiết hơn.
    // Ví dụ: "Đã đến giờ uống thuốc Huyết áp. Vui lòng uống 1 viên vào buổi sáng. Hiện còn 29 viên."
    let reminderNote = note;
    if (!reminderNote) {
      let medName = 'thuốc';
      let medForm = 'viên';
      let remaining = null;
      // số liều mặc định mỗi lần (nếu model không có thông tin), dùng 1
      const defaultDose = 1;
      try {
        const med = await Medication.findById(medicationId).select('name form remainingQuantity');
        if (med) {
          if (med.name) medName = med.name;
          if (med.form) medForm = med.form;
          if (typeof med.remainingQuantity !== 'undefined' && med.remainingQuantity !== null) remaining = med.remainingQuantity;
        }
      } catch (e) {
        // Nếu không lấy được medication, giữ fallback
      }

      // Lấy khung giờ chính (nếu có) -> chuyển Sáng/Chiều/Tối thành 'buổi sáng'...
      let timePhrase = '';
      if (Array.isArray(times) && times.length > 0) {
        const first = times[0].time || '';
        if (first === 'Sáng') timePhrase = 'buổi sáng';
        else if (first === 'Chiều') timePhrase = 'buổi chiều';
        else if (first === 'Tối') timePhrase = 'buổi tối';
        else timePhrase = first; // fallback: dùng nguyên chuỗi
      } else if (typeof note === 'string' && /sáng|chiều|tối/i.test(note)) {
        // cố gắng suy ra từ note (hiếm dùng)
        const n = note.toLowerCase();
        if (n.includes('sáng')) timePhrase = 'buổi sáng';
        else if (n.includes('chiều')) timePhrase = 'buổi chiều';
        else if (n.includes('tối')) timePhrase = 'buổi tối';
      }

      const doseText = `Vui lòng uống ${defaultDose} ${medForm}` + (timePhrase ? ` vào ${timePhrase}` : '') + '.';
      const remainingText = remaining !== null ? ` Hiện còn ${remaining} ${medForm}.` : '';
      reminderNote = `Đã đến giờ uống thuốc ${medName}. ${doseText}${remainingText}`;
    }

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
    const { medicationId, times, repeatTimes, note, startDate, endDate, isActive, reminderType, voice, updateToday } = req.body;
    const currentReminder = await Reminder.findById(req.params.id);
    if (!currentReminder) {
      return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {};
    if (medicationId) updateData.medicationId = medicationId;
    if (times) updateData.times = times;
    if (note) updateData.note = note;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (reminderType) updateData.reminderType = reminderType;
    if (voice) updateData.voice = voice;

    // Xử lý cập nhật repeatTimes (giờ nhắc)
    if (repeatTimes && Array.isArray(repeatTimes)) {
      updateData.repeatTimes = repeatTimes.map(rt => ({
        time: rt.time // Chỉ lưu time, đơn giản
      }));

      // Nếu user muốn áp dụng ngay hôm nay
      if (updateToday) {
        const today = new Date().toISOString().slice(0, 10);
        const MedicationHistory = require('../models/MedicationHistory');

        // Xóa MedicationHistory cũ của hôm nay (chỉ những cái pending)
        await MedicationHistory.deleteMany({
          reminderId: currentReminder._id,
          date: today,
          status: 'pending'
        });

        // Tạo MedicationHistory mới theo giờ mới
        for (const rt of repeatTimes) {
          await MedicationHistory.create({
            userId: currentReminder.userId,
            medicationId: currentReminder.medicationId,
            reminderId: currentReminder._id,
            date: today,
            time: rt.time,
            taken: false,
            status: 'pending'
          });
        }
        console.log(`[UPDATE] Đã cập nhật MedicationHistory cho ngày ${today}`);
      }
    }

    // Cập nhật Reminder
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!reminder) return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    
    res.json({
      message: updateToday ? 'Đã cập nhật nhắc nhở và áp dụng cho hôm nay' : 'Đã cập nhật nhắc nhở (áp dụng từ ngày mai)',
      reminder
    });
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
