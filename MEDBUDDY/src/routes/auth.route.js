
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');


// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);


// Gửi OTP về email để quên mật khẩu
router.post('/send-otp', authController.sendOtpForgotPassword);


// Xác thực OTP riêng
router.post('/verify-otp', authController.verifyOtp);

// Đổi mật khẩu sau khi xác thực OTP
router.post('/reset-password', authController.resetPasswordWithOtp);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
