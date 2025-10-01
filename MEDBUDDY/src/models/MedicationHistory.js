const mongoose = require('mongoose');

const MedicationHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  reminderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reminder', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  taken: { type: Boolean, default: false }, // Đã uống chưa
  takenAt: { type: Date }, // Thời điểm xác nhận uống
  status: { type: String, enum: ['on_time', 'late', 'missed'], default: 'missed' }, // Trạng thái uống
});

module.exports = mongoose.model('MedicationHistory', MedicationHistorySchema);