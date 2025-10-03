const { GoogleGenerativeAI } = require('@google/generative-ai');
const NodeCache = require('node-cache');
const BloodPressure = require('../models/BloodPressure');
const AIAnalysis = require('../models/AIAnalysis');
const User = require('../models/User');
const Alert = require('../models/Alert');
const { formatVN, now } = require('../utils/dateHelper');

class BloodPressureAIService {
  constructor() {
    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey, { apiVersion: "v1" });
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    // Cache để giảm chi phí API calls
    this.cache = new NodeCache({ stdTTL: 1800 }); // Cache 30 phút
  }

  // Phân tích huyết áp với AI - Core function
  async analyzeBloodPressure(userId, bloodPressureId) {
    try {
      // Lấy dữ liệu huyết áp hiện tại
      const bloodPressure = await BloodPressure.findById(bloodPressureId).populate('userId');
      if (!bloodPressure) {
        throw new Error('Không tìm thấy dữ liệu huyết áp');
      }

      // Lấy thông tin user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Không tìm thấy thông tin user');
      }

      // Lấy lịch sử huyết áp 7 ngày gần nhất (khác record hiện tại)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const history = await BloodPressure.find({
        userId: userId,
        _id: { $ne: bloodPressureId },
        measuredAt: { $gte: oneWeekAgo }
      })
      .sort({ measuredAt: -1 })
      .limit(10)
      .select('systolic diastolic pulse measuredAt note');

      // Chuẩn bị dữ liệu cho AI
      const analysisData = {
        systolic: bloodPressure.systolic,
        diastolic: bloodPressure.diastolic,
        pulse: bloodPressure.pulse,
        measuredAt: formatVN(bloodPressure.measuredAt, 'DD/MM/YYYY HH:mm'),
        note: bloodPressure.note || '',
        history: history.map(h => ({
          systolic: h.systolic,
          diastolic: h.diastolic,
          pulse: h.pulse,
          date: h.measuredAt.toISOString().split('T')[0],
          time: h.measuredAt.toTimeString().split(' ')[0].substring(0, 5)
        }))
      };

      // Profile user cho AI - chỉ lấy thông tin cơ bản
      const userProfile = {
        age: user.dateOfBirth ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        gender: null, 
        conditions: [],
        medications: [],
        smoking: false,
        exercise: 'none'
      };

      // Gọi Gemini AI để phân tích
      const aiResult = await this.callGeminiAPI(analysisData, userProfile);

      // Tính risk score nếu chưa có
      const riskScore = aiResult.riskScore || this.calculateRiskScore(aiResult);

      // Lưu kết quả phân tích vào database
      const aiAnalysis = new AIAnalysis({
        userId: userId,
        bloodPressureId: bloodPressureId,
        analyzer: 'Gemini AI',
        
      
        bloodPressureAnalysis: aiResult.bloodPressureAnalysis || this.getDefaultBPAnalysis(analysisData),
        consistencyAnalysis: aiResult.consistencyAnalysis || this.getDefaultConsistencyAnalysis(history.length),
        aiSuggestion: aiResult.aiSuggestion || this.getDefaultAIRefaultSuggestion(analysisData, userProfile),
        
        // Thống kê tổng hợp
        summary: aiResult.summary || `${this.getRiskLevelText(riskScore)} - ${this.getRiskAssessment(analysisData)}`,
        riskLevel: aiResult.riskLevel || this.convertRiskScoreToLevel(riskScore),
        riskScore: riskScore,
        urgency: aiResult.urgency || this.determineUrgency(riskScore, analysisData),
        
        // Dữ liệu gốc
        analyzedData: {
          systolic: bloodPressure.systolic,
          diastolic: bloodPressure.diastolic,
          pulse: bloodPressure.pulse,
          measuredAt: bloodPressure.measuredAt,
          note: bloodPressure.note || ''
        },
        
        // Context
        analysisContext: {
          historyCount: history.length,
          userAge: userProfile.age,
          userGender: userProfile.gender,
          hasMedicalHistory: userProfile.conditions.length > 0,
          hasMedications: userProfile.medications.length > 0
        },
        
        // Metadata
        aiMetadata: {
          geminiModelVersion: 'gemini-pro',
          cacheHit: aiResult.cacheHit || false
        }
      });

      await aiAnalysis.save();
      
      // Populate user để có tên thật
      await aiAnalysis.populate('userId', 'fullName');

      // Tạo alert nếu urgency cao hoặc nguy hiểm
      if (aiAnalysis.urgency === 'urgent') {
        await this.createUrgentAlert(userId, aiAnalysis, bloodPressure);
      } else if (aiAnalysis.urgency === 'high') {
        await this.createHighAlert(userId, aiAnalysis, bloodPressure);
      }

      return {
        success: true,
        analysis: aiAnalysis,
        formattedResult: aiAnalysis.formattedAnalysis
      };

    } catch (error) {
      console.error('Blood Pressure AI Analysis Error:', error);
      throw error;
    }
  }

  // Helper methods để tạo default analysis nếu AI fail
  getDefaultBPAnalysis(data) {
    const category = this.categorizeBP(data.systolic, data.diastolic);
    
    return {
      title: category.title,
      status: category.status,
      metric: `Huyết áp hiện tại: ${data.systolic}/${data.diastolic} mmHg`,
      icon: category.icon,
      recommendation: category.recommendation
    };
  }

  getDefaultConsistencyAnalysis(historyCount) {
    if (historyCount === 0) {
      return {
        title: "Chưa có lịch sử đo",
        status: "warning",
        metric: "Bạn chưa có dữ liệu lịch sử",
        icon: "⚠️",
        recommendation: "Hãy đo huyết áp hàng ngày để theo dõi sức khỏe"
      };
    } else if (historyCount >= 5) {
      return {
        title: "Đo huyết áp đều đặn",
        status: "success", 
        metric: `Bạn đã đo huyết áp ${historyCount}/${historyCount >= 7 ? '7' : 'nhiều'} ngày qua`,
        icon: "✅",
        recommendation: "Hãy tiếp tục duy trì thói quen tốt này"
      };
    } else {
      return {
        title: "Thói quen đo cần cải thiện",
        status: "warning",
        metric: `Chỉ đo được ${historyCount}/7 ngày qua`,
        icon: "⚠️", 
        recommendation: "Hãy cố gắng đo huyết áp đều đặn hơn"
      };
    }
  }

  getDefaultAIRefaultSuggestion(data, userProfile) {
    const suggestions = [];
    
    if (data.systolic > 140 || data.diastolic > 90) {
      suggestions.push("Cần đi khám bác sĩ trong tuần này");
    }
    
    if (userProfile.age && userProfile.age > 50) {
      suggestions.push("Người có tuổi cần theo dõi chặt chẽ hơn");
    }
    
    if (data.pulse && data.pulse > 100) {
      suggestions.push("Nhịp tim nhanh, tránh stress");
    }

    return {
      title: "Gợi ý từ AI",
      status: "info",
      metric: "Dựa trên chỉ số huyết áp hiện tại của bạn",
      icon: "🧠",
      recommendation: suggestions.length > 0 ? suggestions.join('. ') : "Tham khảo ý kiến bác self để được tư vấn cụ thể"
    };
  }

  // Phân loại huyết áp theo tiêu chuẩn
  categorizeBP(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 110) return {
      title: "Tăng huyết áp cấp cứu",
      status: "warning",
      icon: "🚨",
      recommendation: "Cần đến bệnh viện ngay lập tức!"
    };
    if (systolic >= 140 || diastolic >= 90) return {
      title: "Tăng huyết áp độ 2", 
      status: "warning",
      icon: "⚠️",
      recommendation: "Cần đi khám bác self trong tuần này"
    };
    if (systolic >= 130 || diastolic >= 80) return {
      title: "Tăng huyết áp độ 1",
      status: "warning", 
      icon: "⚠️",
      recommendation: "Theo dõi và điều chỉnh lối sống"
    };
    if (systolic >= 120 || diastolic >= 80) return {
      title: "Tiền tăng huyết áp",
      status: "info",
      icon: "💡", 
      recommendation: "Ngăn ngừa bằng thay đổi lối sống"
    };
    if (systolic < 90 && diastolic < 60) return {
      title: "Hạ huyết áp",
      status: "warning",
      icon: "🔻",
      recommendation: "Uống đủ nước và có thể cần khám"
    };
    
    return {
      title: "Huyết áp bình thường",
      status: "success",
      icon: "✅", 
      recommendation: "Tiếp tục duy trì lối sống lành mạnh"
    };
  }

  // Tính risk score
  calculateRiskScore(data) {
    let score = 50;
    
    const category = this.categorizeBP(data.systolic || 120, data.diastolic || 80);
    
    switch (category.status) {
      case 'success': score = 20; break;
      case 'info': score = 35; break;
      case 'warning': score = 75; break;
    }
    
    return score;
  }

  // Convert risk score to level
  convertRiskScoreToLevel(score) {
    if (score >= 80) return 'nguy_hiểm';
    if (score >= 60) return 'cao';
    if (score >= 40) return 'trung_bình';
    if (score >= 20) return 'nhẹ';
    return 'bình_thường';
  }

  // Determine urgency
  determineUrgency(score, data) {
    if (score >= 80 || (data.systolic >= 180 || data.diastolic >= 110)) return 'urgent';
    if (score >= 60 || (data.systolic >= 160 || data.diastolic >= 100)) return 'high';
    return 'normal';
  }

  // Get risk level text
  getRiskLevelText(score) {
    return this.convertRiskScoreToLevel(score);
  }

  // Get risk assessment
  getRiskAssessment(data) {
    return this.categorizeBP(data.systolic, data.diastolic).recommendation;
  }

  // Tạo urgent alert
  async createUrgentAlert(userId, aiAnalysis, bloodPressure) {
    const alert = new Alert({
      userId: userId,
      type: 'ai_urgent_bp_analysis',
      message: `🚨 Cảnh báo khẩn cấp từ AI: ${aiAnalysis.bloodPressureAnalysis.title} - Risk Score ${aiAnalysis.riskScore}/100`,
      data: {
        aiAnalysisId: aiAnalysis._id,
        bloodPressureId: bloodPressure._id,
        urgency: 'urgent',
        recommendations: [
          aiAnalysis.bloodPressureAnalysis.recommendation,
          aiAnalysis.aiSuggestion.recommendation
        ]
      },
      priority: 'urgent'
    });

      await alert.save();
  }

  // Tạo high priority alert  
  async createHighAlert(userId, aiAnalysis, bloodPressure) {
    const alert = new Alert({
      userId: userId,
      type: 'ai_high_bp_analysis',
      message: `⚠️ Phân tích AI quan trọng: ${aiAnalysis.bloodPressureAnalysis.title} - Risk Score ${aiAnalysis.riskScore}/100`,
      data: {
        aiAnalysisId: aiAnalysis._id,
        bloodPressureId: bloodPressure._id,
        urgency: 'high',
        recommendations: [
          aiAnalysis.bloodPressureAnalysis.recommendation,
          aiAnalysis.aiSuggestion.recommendation
        ]
      },
      priority: 'high'
    });

      await alert.save();
  }

  // Lấy AI insights của user
  async getAIInsights(userId, limit = 10) {
    try {
      const analyses = await AIAnalysis.find({
        userId: userId,
        isArchived: false
      })
      .populate('bloodPressureId', 'systolic diastolic measuredAt')
      .sort({ createdAt: -1 })
      .limit(limit);

      if (analyses.length === 0) {
        return {
          success: true,
          message: 'Chưa có phân tích AI nào',
          insights: []
        };
      }

      // Tính thống kê tổng hợp
      const stats = this.calculateOverallStats(analyses);
      
      return {
        success: true,
        insights: analyses.map(a => a.formattedAnalysis),
        overallStats: stats
      };

    } catch (error) {
      console.error('Get AI Insights Error:', error);
      throw error;
    }
  }

  // Tính thống kê tổng hợp
  calculateOverallStats(analyses) {
    if (!analyses || analyses.length === 0) {
      return null;
    }

    const totalReadings = analyses.length;
    const avgRiskScore = analyses.reduce((sum, a) => sum + a.riskScore, 0) / totalReadings;
    
    const urgencyCounts = analyses.reduce((acc, a) => {
      acc[a.urgency] = (acc[a.urgency] || 0) + 1;
      return acc;
    }, {});

    const riskLevelCounts = analyses.reduce((acc, a) => {
      acc[a.riskLevel] = (acc[a.riskLevel] || 0) + 1;
      return acc;
    }, {});

    return {
      totalAnalyses: totalReadings,
      averageRiskScore: Math.round(avgRiskScore),
      urgencyDistribution: urgencyCounts,
      riskLevelDistribution: riskLevelCounts,
      latestAnalysis: analyses[0].formattedAnalysis
    };
  }

  // ===== GEMINI AI METHODS =====

  // Gọi Gemini API để phân tích huyết áp
  async callGeminiAPI(readingData, userProfile = {}) {
    try {
      // Tạo cache key từ dữ liệu
      const cacheKey = `bp_${readingData.systolic}_${readingData.diastolic}_${userProfile.age || 'unknown'}`;
      
      // Kiểm tra cache trước
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const prompt = this.buildBloodPressurePrompt(readingData, userProfile);
      
      // Sử dụng try-catch nội bộ để xử lý lỗi cụ thể
      let text;
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      } catch (apiError) {
        // Thử với model cũ hơn nếu model mới không hoạt động
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      }
      
      // Parse AI response thành JSON
      const analysisResult = this.parseAIResponse(text);
      
      // Cache kết quả
      this.cache.set(cacheKey, analysisResult);
      
      return analysisResult;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Không thể phân tích với AI: ' + error.message);
    }
  }

  // Tạo prompt phân tích huyết áp
  buildBloodPressurePrompt(data, userProfile) {
    return `
Bạn là một bác sĩ AI chuyên về tim mạch và huyết áp với 20 năm kinh nghiệm. Phân tích dữ liệu và đưa lời khuyên CỤ THỂ, THỰC TẾ:

DỮ LIỆU HIỆN TẠI:
- Chỉ số huyết áp: ${data.systolic}/${data.diastolic} mmHg
- Nhịp tim: ${data.pulse || 'Không có'} bpm
- Thời gian đo: ${data.measuredAt}
- Ghi chú: ${data.note || 'Không có'}

LỊCH SỬ HUYẾT ÁP (${data.history?.length || 0} lần đo gần đây):
${data.history?.slice(0, 7).map((h, i) => `${i + 1}. ${h.date}: ${h.systolic}/${h.diastolic} (${h.time || ''})`).join('\n') || 'Không có lịch sử'}

PROFILE BỆNH NHÂN:
- Tuổi: ${userProfile.age || 'Không có'}
- Tiền sử bệnh: ${userProfile.conditions?.join(', ') || 'Không có'}
- Thuốc đang dùng: ${userProfile.medications?.join(', ') || 'Không'}
- Lối sống: Hút thuốc ${userProfile.smoking ? 'Có' : 'Không'}, Tập thể dục ${userProfile.exercise || 'Không có'}

YÊU CẦU PHÂN TÍCH:
1. Đánh giá chính xác tình trạng huyết áp dựa trên tuổi và chỉ số
2. Đưa ra lời khuyên CỤ THỂ, HÀNH ĐỘNG ĐƯỢC (không chung chung)
3. Gợi ý thời gian đo huyết áp phù hợp
4. Khuyến nghị thay đổi lối sống cụ thể
5. Cảnh báo khi nào cần gặp bác sĩ

PHÂN TÍCH THEO GIAO DIỆN HIỂN THỊ (giống hình UI):
Yêu cầu tạo JSON với EXACT structure sau:

{
  "bloodPressureAnalysis": {
    "title": "Tên tiêu đề phân tích",
    "status": "warning|success|info",
    "metric": "Thông tin cụ thể về chỉ số",
    "icon": "⚠️|✅|💊|🩺|❤️|📊",
    "recommendation": "Lời khuyên cụ thể"
  },
  "consistencyAnalysis": {
    "title": "Tên tiêu đề thói quen", 
    "status": "warning|success|info",
    "metric": "Thông tin về tần suất đo",
    "icon": "⚠️|✅|📅|⏰|📈|📉", 
    "recommendation": "Lời khuyên về thói quen"
  },
  "aiSuggestion": {
    "title": "Gợi ý từ AI",
    "status": "info|warning|success", 
    "metric": "Thông tin phân tích cá nhân hóa",
    "icon": "💡|🧠|🎯|💪|🏃|🥗|😴",
    "recommendation": "Lời khuyên hành động cụ thể"
  },
  "riskLevel": "bình_thường|nhẹ|trung_bình|cao|nguy_hiểm",
  "riskScore": điểm_từ_0_đến_100,
  "urgency": "normal|high|urgent",
  "summary": "Tóm tắt ngắn gọn tình trạng"
}

QUAN TRỌNG: Chỉ trả về JSON object với EXACT keys như trên, không có text khác.

VÍ DỤ RESPONSE CỤ THỂ:
{
  "bloodPressureAnalysis": {
    "title": "Huyết áp bình thường",
    "status": "success",
    "metric": "120/80 mmHg - Huyết áp lý tưởng",
    "icon": "✅",
    "recommendation": "Duy trì lối sống lành mạnh để giữ huyết áp ổn định."
  },
  "consistencyAnalysis": {
    "title": "Cần thiết lập thói quen đo",
    "status": "warning",
    "metric": "Chưa có dữ liệu lịch sử để đánh giá",
    "icon": "📅",
    "recommendation": "Đo huyết áp 2 lần/ngày: sáng (trước ăn) và tối (trước ngủ). Ghi chép trong 1 tuần để có dữ liệu đánh giá."
  },
  "aiSuggestion": {
    "title": "Gợi ý cải thiện sức khỏe tim mạch",
    "status": "info",
    "metric": "Dành cho người 26 tuổi, huyết áp bình thường",
    "icon": "💪",
    "recommendation": "1) Tập thể dục 30 phút/ngày. 2) Ăn uống cân bằng. 3) Ngủ đủ 7-8 tiếng. 4) Giảm căng thẳng."
  },
  "riskLevel": "bình_thường",
  "riskScore": 15,
  "urgency": "normal",
  "summary": "Huyết áp hiện tại bình thường. Cần theo dõi định kỳ và cải thiện lối sống."
}

HƯỚNG DẪN CHỌN ICON:
- bloodPressureAnalysis: ✅ (bình thường), ⚠️ (cảnh báo), ❤️ (tim mạch), 🩺 (y tế), 💊 (thuốc)
- consistencyAnalysis: 📅 (lịch), ⏰ (thời gian), 📈 (tăng), 📉 (giảm), ⚠️ (cảnh báo)
- aiSuggestion: 💡 (ý tưởng), 💪 (sức khỏe), 🏃 (tập thể dục), 🥗 (ăn uống), 😴 (ngủ), 🎯 (mục tiêu)
`;
  }

  // Parse AI response
  parseAIResponse(text) {
    try {
      // Fix common text errors before parsing
      text = text.replace(/bác self/gi, "bác sĩ");
      
      // Tìm JSON trong response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
      
      // Xem xét tiến hành phân tích thủ công
      const analysis = this.performManualAnalysis(text);
      if (analysis) return analysis;
      
      // Fallback nếu không tìm thấy JSON hoặc không thể phân tích thủ công
      return {
        bloodPressureAnalysis: {
          title: "Phân tích huyết áp",
          status: "info",
          metric: "Cần thêm thông tin để phân tích",
          icon: "🧠",
          recommendation: "Đo huyết áp thường xuyên để có dữ liệu đánh giá"
        },
        consistencyAnalysis: {
          title: "Thói quen đo huyết áp",
          status: "warning", 
          metric: "Chưa có đủ dữ liệu lịch sử",
          icon: "⚠️",
          recommendation: "Hãy đo huyết áp đều đặn mỗi ngày"
        },
        aiSuggestion: {
          title: "Gợi ý từ AI",
          status: "info",
          metric: "Dựa trên chỉ số hiện tại",
          icon: "🧠", 
          recommendation: " Tham khảo ý kiến bác sĩ để được tư vấn cụ thể"
        },
        riskLevel: "unknown",
        riskScore: 50,
        urgency: "normal",
        summary: "Cần thêm dữ liệu để phân tích chính xác"
      };
    } catch (error) {
      console.error('Parse AI Response Error:', error);
      throw new Error('Không thể phân tích kết quả AI');
    }
  }

  // Tính điểm risk dựa trên phân tích
  calculateRiskScore(analysis) {
    // Kiểm tra nếu BP Analysis có chỉ số huyết áp bình thường
    if (analysis.bloodPressureAnalysis?.title?.toLowerCase().includes('bình thường')) {
      // Huyết áp bình thường, risk score thấp
      let score = 25; // Giảm base score xuống
      
      // Điểm từ thói quen đo đều đặn
      if (analysis.consistencyAnalysis?.status === 'warning') {
        score += 15; // Tăng lên chút vì chưa có lịch sử đo
      }
      
      // Cập nhật các trường khác cho phù hợp
      analysis.riskLevel = "bình_thường";
      analysis.urgency = "normal";
      
      return score;
    } else {
      let score = 50; // Base score
      
      // Điểm từ blood pressure category
      switch (analysis.bloodPressureAnalysis?.status) {
        case 'success': score += 0; break;
        case 'warning': score += 20; break;
        case 'info': score += 10; break;
      }
      
      // Điểm từ thói quen đo đều đặn
      switch (analysis.consistencyAnalysis?.status) {
        case 'success': score -= 10; break;
        case 'warning': score += 15; break;
      }
      
      // Điểm từ urgency
      switch (analysis.urgency) {
        case 'urgent': score += 40; break;
        case 'high': score += 20; break;
        case 'normal': score += 0; break;
      }
      
      return Math.max(0, Math.min(100, score));
    }
  }
  
  // Phân tích thủ công kết quả từ AI text nếu JSON parsing thất bại
  performManualAnalysis(text) {
    try {
      // Xử lý bằng regex
      // Sửa lỗi phổ biến như "bác self" thành "bác sĩ"
      text = text.replace(/bác self/gi, "bác sĩ");
      text = text.replace(/bác sĩ/gi, "bác sĩ"); // Ensure consistency
      
      // Kiểm tra nếu có "huyết áp bình thường" trong văn bản
      const isNormalBP = text.toLowerCase().includes("huyết áp bình thường");
      
      // Tạo JSON từ phân tích thủ công
      const analysis = {
        bloodPressureAnalysis: {
          title: isNormalBP ? "Huyết áp bình thường" : "Cần phân tích thêm",
          status: isNormalBP ? "success" : "info",
          metric: text.match(/\d+\/\d+\s?mmHg/) ? `Huyết áp hiện tại: ${text.match(/\d+\/\d+\s?mmHg/)[0]}` : "Chưa có thông tin cụ thể",
          icon: isNormalBP ? "✅" : "🔍",
          recommendation: isNormalBP ? "Tiếp tục duy trì lối sống lành mạnh" : "Hãy tham khảo ý kiến bác sĩ"
        },
        consistencyAnalysis: {
          title: "Theo dõi đều đặn",
          status: "info",
          metric: "Thói quen đo huyết áp",
          icon: "📊",
          recommendation: "Hãy đo huyết áp đều đặn để có dữ liệu chuẩn xác hơn"
        },
        aiSuggestion: {
          title: "Gợi ý từ AI",
          status: "info",
          metric: "Dựa trên chỉ số hiện tại",
          icon: "🧠",
          recommendation: "Tham khảo ý kiến bác sĩ để được tư vấn cụ thể"
        },
        riskLevel: isNormalBP ? "bình_thường" : "chưa_xác_định",
        riskScore: isNormalBP ? 25 : 50,
        urgency: isNormalBP ? "normal" : "normal",
        summary: isNormalBP ? "Huyết áp bình thường - Tiếp tục duy trì lối sống lành mạnh" : "Cần theo dõi thêm"
      };
      
      return analysis;
    } catch (error) {
      console.error('Manual analysis error:', error);
      return null;
    }
  }

}

module.exports = BloodPressureAIService;
