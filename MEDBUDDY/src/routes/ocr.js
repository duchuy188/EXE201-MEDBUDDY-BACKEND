const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const ocrController = require('../controllers/ocr.controller');

// POST /api/ocr
router.post('/', upload.single('image'), ocrController.ocrPrescription);

module.exports = router;
