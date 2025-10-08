const mongoose = require('mongoose');

// RepeatTime chỉ lưu cấu hình thời gian, không lưu trạng thái
const RepeatTimeSchema = new mongoose.Schema({
  time: { type: String, required: true } // HH:mm
});

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  reminderType: { type: String, enum: ['normal', 'voice'], default: 'normal' },
  times: [{
    time: { type: String, enum: ['Sáng', 'Chiều', 'Tối'], required: true },
  }],
  startDate: { type: String, required: true }, // Ngày bắt đầu (YYYY-MM-DD)
  endDate: { type: String, required: true }, // Ngày kết thúc (YYYY-MM-DD)
  repeatTimes: [RepeatTimeSchema],
  note: { type: String },
  voice: { 
    type: String, 
    enum: ['banmai', 'lannhi', 'leminh', 'myan', 'thuminh', 'giahuy', 'linhsan'],
    // No default here; controller will set voice only for voice reminders
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  // Các field legacy giữ lại để tương thích
  status: { type: String, enum: ['pending', 'completed', 'snoozed'], default: 'pending' },
  snoozeTime: { type: Date, required: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdByType: { type: String, enum: ['patient', 'relative'], required: false }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
