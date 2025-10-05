
const mongoose = require('mongoose');

// User model
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
      unique: true,
    },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['relative', 'patient', 'admin'],
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  avatar: {
    type: String,
    default: '', // Link ảnh đại diện
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  blockedAt: {
    type: Date,
    default: null,
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // Package info
  activePackage: {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    features: [String],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
