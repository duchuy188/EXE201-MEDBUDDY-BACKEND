const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  reminderType: { type: String, enum: ['normal', 'voice'], default: 'normal' },
  time: { type: String, required: true }, // HH:mm hoặc ISO nếu cần
  startDate: { type: String, required: true }, // Ngày bắt đầu (YYYY-MM-DD)
  endDate: { type: String, required: true }, // Ngày kết thúc (YYYY-MM-DD)
  repeat: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
  repeatDays: { type: [Number], validate: {
    validator: function(v) {
      return v.every(num => num >= 0 && num <= 6); // 0 = Sunday, 6 = Saturday
    },
    message: 'repeatDays must be between 0 and 6'
  }}, // Các ngày lặp lại trong tuần (0-6, 0 = Chủ nhật)
  repeatTimes: [{ 
    time: String, // HH:mm
    taken: { type: Boolean, default: false } // Đánh dấu đã uống thuốc chưa
  }],
  note: { type: String },
  voice: { 
    type: String, 
    enum: ['banmai', 'lannhi', 'leminh', 'myan', 'thuminh', 'giahuy', 'linhsan'],
    default: 'banmai'
  },
  speed: {
    type: Number,
    enum: [-3, -2, -1, 0, 1, 2, 3],
    default: 0
  },
  // audioUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'snoozed'], default: 'pending' }, // Trạng thái nhắc nhở
  snoozeTime: { type: Date, required: false } // Thời gian nhắc lại nếu chọn "Hãy nhắc tôi sau"
});

module.exports = mongoose.model('Reminder', ReminderSchema);
