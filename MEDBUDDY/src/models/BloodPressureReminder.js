const mongoose = require('mongoose');

const BloodPressureReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  times: [{
    time: {
      type: String, // kiểu giờ, ví dụ "07:00"
      required: true
    }
  }],
  note: {
    type: String,
    default: 'Đã đến giờ đo huyết áp!'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'snoozed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BloodPressureReminder', BloodPressureReminderSchema);
