const mongoose = require('mongoose');

const AIAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodPressureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodPressure',
    required: true
  },
  
  // Thông tin người phân tích
  analyzer: {
    type: String,
    default: 'Gemini AI'
  },
  
  // Kết quả phân tích 3 phần như UI
  bloodPressureAnalysis: {
    title: { type: String, required: true },
    status: { type: String, enum: ['warning', 'success', 'info'], required: true },
    metric: { type: String, required: true },
    icon: { type: String, default: '🧠' },
    recommendation: { type: String, required: true }
  },
  
  consistencyAnalysis: {
    title: { type: String, required: true },
    status: { type: String, enum: ['warning', 'success', 'info'], required: true },
    metric: { type: String, required: true },
    icon: { type: String, default: '🧠' },
    recommendation: { type: String, required: true }
  },
  
  aiSuggestion: {
    title: { type: String, default: 'Gợi ý từ AI' },
    status: { type: String, enum: ['warning', 'success', 'info'], default: 'info' },
    metric: { type: String, required: true },
    icon: { type: String, default: '🧠' },
    recommendation: { type: String, required: true }
  },
  
  // Thống kê tổng hợp
  summary: {
    type: String,
    required: true
  },
  
  riskLevel: {
    type: String,
    enum: ['bình_thường', 'nhẹ', 'trung_bình', 'cao', 'nguy_hiểm', 'unknown'],
    required: true
  },
  
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  
  urgency: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Dữ liệu gốc được phân tích
  analyzedData: {
    systolic: Number,
    diastolic: Number,
    pulse: Number,
    measuredAt: Date,
    note: String
  },
  
  // Thông tin context khi phân tích
  analysisContext: {
    historyCount: { type: Number, default: 0 },
    userAge: { type: Number },
    userGender: { type: String },
    hasMedicalHistory: { type: Boolean, default: false },
    hasMedications: { type: Boolean, default: false }
  },
  
  // AI response metadata
  aiMetadata: {
    promptTokens: { type: Number },
    responseTokens: { type: Number },
    processingTime: { type: Number }, // milliseconds
    geminiModelVersion: { type: String, default: 'gemini-pro' },
    cacheHit: { type: Boolean, default: false }
  },
  
  // Trạng thái
  isRead: {
    type: Boolean,
    default: false
  },
  
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Feedback từ user (optional)
  userFeedback: {
    helpful: { type: Boolean },
    submittedAt: { type: Date },
    comment: { type: String }
  }
}, {
  timestamps: true
});

// Indexes cho performance
AIAnalysisSchema.index({ userId: 1, createdAt: -1 });
AIAnalysisSchema.index({ bloodPressureId: 1 });
AIAnalysisSchema.index({ urgency: 1, isRead: 1 });
AIAnalysisSchema.index({ riskScore: 1 });
AIAnalysisSchema.index({ riskLevel: 1 });

// Virtual field để format dữ liệu cho API
AIAnalysisSchema.virtual('formattedAnalysis').get(function() {
  return {
    userName: this.userId?.fullName || 'Người dùng', // Lấy tên thật từ User model
    analyses: [
      {
        title: this.bloodPressureAnalysis.title,
        status: this.bloodPressureAnalysis.status,
        metric: this.bloodPressureAnalysis.metric,
        icon: this.bloodPressureAnalysis.icon,
        recommendation: this.bloodPressureAnalysis.recommendation
      },
      {
        title: this.consistencyAnalysis.title,
        status: this.consistencyAnalysis.status,
        metric: this.consistencyAnalysis.metric,
        icon: this.consistencyAnalysis.icon,
        recommendation: this.consistencyAnalysis.recommendation
      },
      {
        title: this.aiSuggestion.title,
        status: this.aiSuggestion.status,
        metric: this.aiSuggestion.metric,
        icon: this.aiSuggestion.icon,
        recommendation: this.aiSuggestion.recommendation
      }
    ],
    summary: this.summary,
    riskScore: this.riskScore,
    riskLevel: this.riskLevel,
    urgency: this.urgency,
    analyzedAt: this.createdAt
  };
});

// Pre-save middleware
AIAnalysisSchema.pre('save', function(next) {
  // Tự động set urgency dựa trên riskScore
  if (this.riskScore >= 80) {
    this.urgency = 'urgent';
  } else if (this.riskScore >= 60) {
    this.urgency = 'high';
  } else {
    this.urgency = 'normal';
  }
  
  // Cập nhật riskLevel dựa trên urgency
  if (this.urgency === 'urgent') {
    this.riskLevel = 'nguy_hiểm';
  } else if (this.urgency === 'high') {
    this.riskLevel = 'cao';
  }
  
  next();
});

// Method để đánh dấu đã đọc
AIAnalysisSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method để archive
AIAnalysisSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

// Method để submit feedback
AIAnalysisSchema.methods.submitFeedback = function(helpful, comment) {
  this.userFeedback = {
    helpful: helpful,
    comment: comment,
    submittedAt: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('AIAnalysis', AIAnalysisSchema);
