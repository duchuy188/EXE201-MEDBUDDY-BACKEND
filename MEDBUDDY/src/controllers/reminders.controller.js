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
    // Validate required fields
    const { medicationId, time, startDate, endDate, reminderType } = req.body;
    if (!medicationId || !time || !startDate || !endDate || !reminderType) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc',
        error: 'Missing required fields: medicationId, time, startDate, endDate, reminderType'
      });
    }

    // Validate reminder type
    if (!['normal', 'voice'].includes(reminderType)) {
      return res.status(400).json({
        message: 'Loại nhắc nhở không hợp lệ',
        error: 'reminderType must be either "normal" or "voice"'
      });
    }

    const userId = req.user._id; // Bắt buộc phải có user từ auth middleware
    const { repeat, note, voice, speed } = req.body;
    
    // Create reminder instance with default note if not provided
    const reminderNote = note || "Đã đến giờ uống thuốc rồi";
    
    const reminder = new Reminder({ 
      userId, 
      medicationId, 
      time, 
      repeat, 
      note: reminderNote, 
      startDate, 
      endDate,
      reminderType: reminderType || 'normal',
      voice: voice || 'banmai',
      speed: speed || 0
    });

    // Generate TTS only for voice reminders
    if (reminder.reminderType === 'voice') {
      const ttsResult = await TextToSpeechService.generateSpeech(reminderNote, {
        voice: reminder.voice,
        speed: reminder.speed
      });

      if (ttsResult.success) {
        reminder.audioUrl = ttsResult.audioUrl;
      } else {
        console.error('TTS generation failed:', ttsResult.error);
      }
    }

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
    const { medicationId, time, repeat, note, startDate, endDate, isActive, reminderType, voice, speed } = req.body;
    const currentReminder = await Reminder.findById(req.params.id);
    if (!currentReminder) {
      return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    }

    const updateData = { 
      medicationId, 
      time, 
      repeat, 
      note, 
      startDate, 
      endDate, 
      isActive
    };

    // Update reminderType if provided
    if (reminderType) {
      updateData.reminderType = reminderType;
      // Nếu chuyển sang normal, xóa các thông tin về voice
      if (reminderType === 'normal') {
        updateData.voice = undefined;
        updateData.speed = undefined;
        updateData.audioUrl = undefined;
      }
    }

    // Xử lý voice reminder
    if ((reminderType === 'voice' || currentReminder.reminderType === 'voice') && 
        (note || voice || typeof speed !== 'undefined' || reminderType === 'voice')) {
      
      // Cập nhật voice settings nếu được cung cấp
      if (voice) updateData.voice = voice;
      if (typeof speed !== 'undefined') updateData.speed = speed;

      // Tạo audio mới nếu có thay đổi về nội dung hoặc cài đặt voice
      const newNote = note || currentReminder.note;
      const newVoice = voice || currentReminder.voice;
      const newSpeed = typeof speed !== 'undefined' ? speed : currentReminder.speed;

      if (newNote !== currentReminder.note || 
          newVoice !== currentReminder.voice || 
          newSpeed !== currentReminder.speed ||
          (reminderType === 'voice' && !currentReminder.audioUrl)) {
        
        const ttsResult = await TextToSpeechService.generateSpeech(newNote, {
          voice: newVoice,
          speed: newSpeed
        });

        if (ttsResult.success) {
          updateData.audioUrl = ttsResult.audioUrl;
        } else {
          console.error('TTS generation failed:', ttsResult.error);
        }
      }
    }

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
