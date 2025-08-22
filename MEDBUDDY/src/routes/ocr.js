const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const auth = require('../middlewares/auth.middleware');
const ocrController = require('../controllers/ocr.controller');

// POST /api/ocr (có phân quyền)
router.post('/', auth, upload.single('image'), ocrController.ocrPrescription);

module.exports = router;
