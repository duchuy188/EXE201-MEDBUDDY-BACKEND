const mongoose = require('mongoose');

const MedicationHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
  status: { type: String, enum: ['taken', 'missed'], required: true },
  takenAt: { type: Date, default: Date.now },
  note: { type: String }
});

module.exports = mongoose.model('MedicationHistory', MedicationHistorySchema);
