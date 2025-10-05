const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  form: { type: String }, //vien, lo
  image: { type: String },
  note: { type: String },
  quantity: { type: String }, // Tổng số lượng thuốc
  times: [{
    time: { type: String, enum: ['Sáng', 'Chiều', 'Tối'], required: true },
    dosage: { type: String, required: true } // Liều lượng cho từng buổi
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Người tạo thuốc
  createdByType: { type: String, enum: ['patient', 'relative'], required: false }, // Loại người tạo
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medication', MedicationSchema);
