const mongoose = require('mongoose');

const MedicationHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  reminderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reminder', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  taken: { type: Boolean, default: false }, // Đã uống chưa
  takenAt: { type: Date }, // Thời điểm xác nhận uống
  status: { type: String, enum: ['pending', 'on_time', 'late', 'missed', 'skipped', 'snoozed'], default: 'pending' }, // Trạng thái uống
  snoozeUntil: { type: Date }, // Thời điểm nhắc lại sau khi snooze
  snoozeCount: { type: Number, default: 0 }, // Số lần đã snooze
});

module.exports = mongoose.model('MedicationHistory', MedicationHistorySchema);