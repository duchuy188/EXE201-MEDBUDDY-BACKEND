const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, default: 'blood_pressure' },
  message: { type: String, required: true },
  data: { type: Object },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date }
});

module.exports = mongoose.model('Alert', AlertSchema);
