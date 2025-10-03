const express = require('express');
const router = express.Router();
const bloodPressureAIController = require('../controllers/bloodPressureAI.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireFeature } = require('../middlewares/packageAccess.middleware');

// Middleware kiểm tra premium access cho AI features
const aiAccessMiddleware = requireFeature('Phân tích AI huyết áp');

// ===== AI ANALYSIS ENDPOINTS =====

// POST /blood-pressure/ai/analyze - Phân tích huyết áp gần nhất với AI (không cần bloodPressureId)
router.post('/analyze', 
  authMiddleware, 
  aiAccessMiddleware,
  (req, res) => bloodPressureAIController.analyzeLatestBloodPressure(req, res)
);

// POST /blood-pressure/ai/analyze-latest - Phân tích BP record gần nhất (endpoint này giữ nguyên để tương thích ngược)
router.post('/analyze-latest', 
  authMiddleware, 
  aiAccessMiddleware,
  (req, res) => bloodPressureAIController.analyzeLatestBloodPressure(req, res)
);

// POST /blood-pressure/ai/analyze-specific/:bloodPressureId - Phân tích BP cụ thể với Gemini AI
router.post('/analyze-specific/:bloodPressureId', 
  authMiddleware, 
  aiAccessMiddleware,
  (req, res) => bloodPressureAIController.analyzeBloodPressure(req, res)
);

// GET /blood-pressure/ai/insights/:userId - Lấy AI insights của user
router.get('/insights/:userId', 
  authMiddleware, 
  aiAccessMiddleware,
  (req, res) => bloodPressureAIController.getAIInsights(req, res)
);

// GET /blood-pressure/ai/status - Kiểm tra trạng thái AI service
router.get('/status', 
  authMiddleware, 
  (req, res) => bloodPressureAIController.checkAIStatus(req, res)
);

// DELETE /blood-pressure/ai/analysis/:analysisId - Xóa phân tích AI
router.delete('/analysis/:analysisId', 
  authMiddleware, 
  (req, res) => bloodPressureAIController.deleteAnalysis(req, res)
);

module.exports = router;
