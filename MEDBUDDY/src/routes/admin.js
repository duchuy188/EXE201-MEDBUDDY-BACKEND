// Routes admin
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Placeholder routes - có thể thêm routes admin sau
// router.get('/dashboard', authMiddleware, adminController.dashboard);

module.exports = router;