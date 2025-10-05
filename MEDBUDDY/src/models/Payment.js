const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderCode: {
    type: Number,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    default: 'PayOS'
  },
  paymentUrl: {
    type: String
  },
  paidAt: {
    type: Date
  },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
  cancelledAt: {
    type: Date
  },
  expiredAt: {
    type: Date
  },
  // Thông tin từ PayOS webhook
  payosData: {
    type: Object
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
