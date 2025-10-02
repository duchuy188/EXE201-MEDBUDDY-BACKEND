const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  reminderType: { type: String, enum: ['normal', 'voice'], default: 'normal' },
  times: [{
    time: { type: String, enum: ['Sáng', 'Chiều', 'Tối'], required: true },
  }],
  startDate: { type: String, required: true }, // Ngày bắt đầu (YYYY-MM-DD)
  endDate: { type: String, required: true }, // Ngày kết thúc (YYYY-MM-DD)
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
  // audioUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'snoozed'], default: 'pending' }, // Trạng thái nhắc nhở
  snoozeTime: { type: Date, required: false } // Thời gian nhắc lại nếu chọn "Hãy nhắc tôi sau"
});

module.exports = mongoose.model('Reminder', ReminderSchema);
