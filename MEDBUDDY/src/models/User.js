
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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
