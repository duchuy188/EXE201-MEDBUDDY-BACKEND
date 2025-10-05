const mongoose = require('mongoose');

const NotificationHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  deviceToken: { type: String },
});

module.exports = mongoose.model('NotificationHistory', NotificationHistorySchema);
