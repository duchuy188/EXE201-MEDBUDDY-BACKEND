const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");
const ocrController = require("../controllers/ocr.controller");
const { isPaidUser } = require("../middlewares/ocr.middleware");
const authMiddleware = require('../middlewares/auth.middleware');
const { requireFeature } = require('../middlewares/packageAccess.middleware');
const ocrAccessMiddleware = requireFeature('Phân tích đơn thuốc');

router.post('/',
  authMiddleware,
  ocrAccessMiddleware,
  upload.single('image'), // Thêm dòng này
  (req, res) => ocrController.ocrPrescription(req, res)
);

// POST /api/ocr/analyze
router.post('/analyze',
  authMiddleware,
  ocrAccessMiddleware,
  (req, res) => ocrController.analyzeImage(req, res)
);

// GET /api/ocr/test-cloudinary (test connection)
router.get("/test-cloudinary", ocrController.testCloudinary);

module.exports = router;
