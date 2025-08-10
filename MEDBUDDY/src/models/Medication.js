const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  form: { type: String },
  image: { type: String },
  note: { type: String },
  timeOfDay: { type: String }, // Sáng, Chiều, Tối
  time: { type: String }, // Giờ uống cụ thể (HH:mm)
  expirationDate: { type: Date }, // Hạn sử dụng
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medication', MedicationSchema);
