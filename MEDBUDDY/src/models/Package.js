const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // số ngày/tháng/năm
  unit: { type: String, enum: ['day', 'month', 'year'], required: true },
  features: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
