const mongoose = require('mongoose');

const BloodPressureSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  systolic: { type: Number, required: true }, // Tâm thu
  diastolic: { type: Number, required: true }, // Tâm trương
  pulse: { type: Number }, // Nhịp tim (nếu có)
  measuredAt: { type: Date, default: Date.now },
  note: { type: String }
});

module.exports = mongoose.model('BloodPressure', BloodPressureSchema);
