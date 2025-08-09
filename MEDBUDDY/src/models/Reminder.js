const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  time: { type: String, required: true }, // HH:mm hoặc ISO nếu cần
  repeat: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
  note: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
