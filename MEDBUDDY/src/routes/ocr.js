const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const auth = require("../middlewares/auth.middleware");
const ocrController = require("../controllers/ocr.controller");
const { isPaidUser } = require("../middlewares/ocr.middleware");

// POST /api/ocr (có phân quyền)
router.post(
  "/",
  auth,
  isPaidUser,
  upload.single("image"),
  ocrController.ocrPrescription
);

// GET /api/ocr/test-cloudinary (test connection)
router.get("/test-cloudinary", ocrController.testCloudinary);

module.exports = router;
