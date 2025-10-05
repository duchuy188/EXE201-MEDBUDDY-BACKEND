const BloodPressureAIService = require('../services/bloodPressureAI.service');
const BloodPressure = require('../models/BloodPressure');

class BloodPressureAIController {
  constructor() {
    this.aiService = new BloodPressureAIService();
  }

  // POST /api/blood-pressure/ai/analyze-specific/:bloodPressureId - Phân tích huyết áp cụ thể với AI
  async analyzeBloodPressure(req, res) {
    try {
      const userId = req.user._id;
      const { bloodPressureId } = req.params;

      if (!bloodPressureId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu bloodPressureId để phân tích'
        });
      }

      // Kiểm tra blood pressure record có tồn tại không
      const bloodPressure = await BloodPressure.findById(bloodPressureId);
      if (!bloodPressure) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dữ liệu huyết áp'
        });
      }

      // Kiểm tra user có quyền access record này không
      if (bloodPressure.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập dữ liệu này'
        });
      }

      // Phân tích với AI
      const result = await this.aiService.analyzeBloodPressure(userId, bloodPressureId);

      res.json({
        success: true,
        message: 'Phân tích AI thành công',
        data: result.formattedResult
      });

    } catch (error) {
      console.error('Controller - Analyze Blood Pressure Error:', error);
      
      if (error.message.includes('GEMINI_API_KEY')) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi cấu hình AI service',
          error: 'Vui lòng liên hệ admin để khắc phục'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi server khi phân tích AI',
        error: error.message
      });
    }
  }

  // GET /api/blood-pressure/ai-insights/:userId - Lấy AI insights của user
  async getAIInsights(req, res) {
    try {
      const userId = req.params.userId;
      const requestingUserId = req.user._id;

      // Check permission - user chỉ có thể xem insights của chính mình
      if (userId !== requestingUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xem insights của user khác'
        });
      }

      const limit = parseInt(req.query.limit) || 10;
      
      // Validate limit
      if (limit < 1 || limit > 50) {
        return res.status(400).json({
          success: false,
          message: 'Limit phải từ 1 đến 50'
        });
      }

      const result = await this.aiService.getAIInsights(userId, limit);

      res.json({
        success: true,
        data: {
          insights: result.insights,
          overallStats: result.overallStats,
          count: result.insights.length
        }
      });

    } catch (error) {
      console.error('Controller - Get AI Insights Error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy AI insights',
        error: error.message
      });
    }
  }

  // GET /api/blood-pressure/ai/insights - Lấy AI insights của user đang login
  async getMyAIInsights(req, res) {
    try {
      const userId = req.user._id; // Lấy userId từ JWT token
      const limit = parseInt(req.query.limit) || 10;
      
      // Validate limit
      if (limit < 1 || limit > 50) {
        return res.status(400).json({
          success: false,
          message: 'Limit phải từ 1 đến 50'
        });
      }

      const result = await this.aiService.getAIInsights(userId, limit);

      res.json({
        success: true,
        data: {
          insights: result.insights,
          overallStats: result.overallStats,
          count: result.insights.length
        }
      });

    } catch (error) {
      console.error('Controller - Get My AI Insights Error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy AI insights',
        error: error.message
      });
    }
  }

  // POST /api/blood-pressure/ai-analyze-latest - Phân tích BP record gần nhất
  async analyzeLatestBloodPressure(req, res) {
    try {
      const userId = req.user._id;

      // Lấy BP record gần nhất của user
      const latestBP = await BloodPressure.findOne({ userId })
        .sort({ measuredAt: -1 });

      if (!latestBP) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dữ liệu huyết áp gần đây'
        });
      }

      // Phân tích với AI
      const result = await this.aiService.analyzeBloodPressure(userId, latestBP._id);

      res.json({
        success: true,
        message: 'Phân tích BP gần nhất thành công',
        data: result.formattedResult,
        bloodPressureData: {
          systolic: latestBP.systolic,
          diastolic: latestBP.diastolic,
          pulse: latestBP.pulse,
          measuredAt: latestBP.measuredAt
        }
      });

    } catch (error) {
      console.error('Controller - Analyze Latest BP Error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi phân tích BP gần nhất',
        error: error.message
      });
    }
  }



    // GET /api/blood-pressure/ai/debug-access - Debug user access 
  async debugUserAccess(req, res) {
    try {
      const userId = req.user._id;
      
      // Check all access info
      const { getActivePackage, hasFeatureAccess } = require('../services/packageService');
      const User = require('../models/User');
      
      const user = await User.findById(userId).populate('activePackage.packageId').select('+currentAge +age +gender +medicalHistory +currentMedications +smoking +exerciseFrequency +dietPreferences');
      const activePackage = await getActivePackage(userId);
      const hasAccess = await hasFeatureAccess(userId, 'Phân tích AI huyết áp');
      
      // Check BP history
      const BloodPressure = require('../models/BloodPressure');
      const bpHistory = await BloodPressure.find({ userId }).sort({ measuredAt: -1 }).limit(5);
      
      // Check user profile data
      const userProfile = {
        age: user.currentAge || user.age || null,
        gender: user.gender || null,
        conditions: user.medicalHistory || [],
        medications: user.currentMedications || [],
        smoking: user.smoking || false,
        exercise: user.exerciseFrequency || 'none',
        diet: user.dietPreferences || 'normal'
      };
      
      res.json({
        success: true,
        debug: {
          userId,
          userInfo: {
            name: user?.name,
            email: user?.email
          },
          activePackage: activePackage ? {
            packageId: activePackage.packageId?._id,
            packageName: activePackage.packageId?.name,
            isActive: activePackage.isActive,
            startDate: activePackage.startDate,
            endDate: activePackage.endDate,
            features: activePackage.features
          } : null,
          hasAIAccess: hasAccess,
          bloodPressureHistory: {
            count: bpHistory.length,
            records: bpHistory.map(bp => ({
              id: bp._id,
              systolic: bp.systolic,
              diastolic: bp.diastolic,
              measuredAt: bp.measuredAt
            }))
          },
          userProfile: userProfile,
          userActivePackageFromDB: user?.activePackage ? {
            isActive: user.activePackage.isActive,
            features: user.activePackage.features,
            startDate: user.activePackage.startDate,
            endDate: user.activePackage.endDate
          } : null
        }
      });
      
    } catch (error) {
      console.error('Debug access error:', error);
      res.status(500).json({
        success: false,
        message: 'Debug error',
        error: error.message
      });
    }
  }

  // GET /api/blood-pressure/ai-status - Kiểm tra trạng thái AI service
  async checkAIStatus(req, res) {
    try {
      const userId = req.user._id;
      const user = req.user;

      // Check API key configuration
      const hasApiKey = !!process.env.GEMINI_API_KEY;

      // Check premium access
      const hasPremiumAccess = user.activePackage && 
                             user.activePackage.isActive && 
                             user.activePackage.features.includes('Phân tích AI huyết áp');

      // Get recent AI analysis count
      const AIAnalysis = require('../models/AIAnalysis');
      const recentAnalysisCount = await AIAnalysis.countDocuments({
        userId: userId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      res.json({
        success: true,
        data: {
          aiServiceConfigured: hasApiKey,
          hasPremiumAccess: hasPremiumAccess,
          recentAnalysisCount: recentAnalysisCount,
          geminiModel: 'gemini-pro',
          lastChecked: new Date()
        }
      });

    } catch (error) {
      console.error('Controller - Check AI Status Error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra trạng thái AI',
        error: error.message
      });
    }
  }

  // DELETE /api/blood-pressure/ai-analysis/:analysisId - Xóa phân tích AI
  async deleteAnalysis(req, res) {
    try {
      const { analysisId } = req.params;
      const userId = req.user._id;

      const AIAnalysis = require('../models/AIAnalysis');
      const analysis = await AIAnalysis.findOneAndDelete({
        _id: analysisId,
        userId: userId
      });

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phân tích AI để xóa'
        });
      }

      res.json({
        success: true,
        message: 'Đã xóa phân tích AI thành công'
      });

    } catch (error) {
      console.error('Controller - Delete Analysis Error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa phân tích AI',
        error: error.message
      });
    }
  }
}

module.exports = new BloodPressureAIController();
