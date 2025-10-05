const mongoose = require('mongoose');

// Schema trung gian quản lý mối quan hệ giữa người thân và người bệnh
const relativePatientSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  permissions: [{
    type: String,
    enum: ['view_medical_records', 'schedule_medication', 'schedule_appointment', 'manage_health_data']
  }],
  otp: {
    type: String,
    required: false,
  },
  otpExpiresAt: {
    type: Date,
    required: false,
  },
  // Có thể thêm trường ngày tạo, vai trò, quyền hạn nếu cần
}, { timestamps: true });

module.exports = mongoose.model('RelativePatient', relativePatientSchema);
