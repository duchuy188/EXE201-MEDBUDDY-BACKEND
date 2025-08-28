const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  time: { type: String, required: true }, // HH:mm hoặc ISO nếu cần
  date: { type: String, required: false }, // Ngày nhắc nhở (YYYY-MM-DD)
  repeat: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
  note: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'snoozed'], default: 'pending' }, // Trạng thái nhắc nhở
  snoozeTime: { type: Date, required: false } // Thời gian nhắc lại nếu chọn "Hãy nhắc tôi sau"
});

module.exports = mongoose.model('Reminder', ReminderSchema);
