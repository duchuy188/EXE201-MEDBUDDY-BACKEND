
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendOtpEmail = require('../utils/sendOtp');
const otpStore = {};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }
    
   
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account has been blocked.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }
    
   
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '45m' }
    );
    
  
    await RefreshToken.updateMany(
      { userId: user._id, isRevoked: false },
      { isRevoked: true }
    );
    
   
    const refreshToken = jwt.sign(
      { userId: user._id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Lưu refresh token mới vào database
    const refreshTokenDoc = new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    });
    await refreshTokenDoc.save();
    
    res.status(200).json({
      message: 'Login successful!',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendOtpForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Vui lòng nhập email.' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Email không tồn tại.' });
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // OTP hết hạn sau 5 phút
  try {
    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP đã được gửi về email!' });
  } catch (error) {
    res.status(500).json({ message: 'Gửi email thất bại!', error: error.message });
  }
};

// Xác thực OTP và đổi mật khẩu

// Xác thực OTP riêng
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Thiếu thông tin.' });
  }
  const record = otpStore[email];
  if (!record || record.otp != otp || record.expires < Date.now()) {
    return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn.' });
  }
  res.json({ message: 'OTP hợp lệ!' });
};

// Đổi mật khẩu chỉ cần email và newPassword, OTP đã xác thực ở bước trước
exports.resetPasswordWithOtp = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Thiếu thông tin.' });
  }
  const record = otpStore[email];
  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ message: 'OTP chưa xác thực hoặc đã hết hạn.' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Email không tồn tại.' });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  delete otpStore[email];
  res.json({ message: 'Đổi mật khẩu thành công!' });
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role, dateOfBirth } = req.body;
    if (!fullName || !email || !phoneNumber || !password || !role || !dateOfBirth) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    if (!['relative', 'patient'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, phoneNumber, password: hashedPassword, role, dateOfBirth });
    await user.save();
    res.status(201).json({ message: 'Registration successful!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required.' });
    }
    
  
    const tokenDoc = await RefreshToken.findOne({ 
      token: refreshToken, 
      isRevoked: false 
    });
    
    if (!tokenDoc) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }
    
  
    if (tokenDoc.expiresAt < new Date()) {
      await RefreshToken.findByIdAndUpdate(tokenDoc._id, { isRevoked: true });
      return res.status(401).json({ message: 'Refresh token has expired.' });
    }
    
   
    const user = await User.findById(tokenDoc.userId);
    if (!user || user.isBlocked) {
      return res.status(401).json({ message: 'User not found or blocked.' });
    }
    
    
    await RefreshToken.findByIdAndUpdate(tokenDoc._id, { isRevoked: true });
    
    
    const newRefreshToken = jwt.sign(
      { userId: user._id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
  
    const newRefreshTokenDoc = new RefreshToken({
      token: newRefreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    });
    await newRefreshTokenDoc.save();
    
  
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.status(200).json({
      message: 'Token refreshed successfully!',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout 
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      
      const tokenDoc = await RefreshToken.findOne({ 
        token: refreshToken, 
        isRevoked: false 
      });
      
      if (tokenDoc) {
        
        await RefreshToken.updateMany(
          { userId: tokenDoc.userId, isRevoked: false },
          { isRevoked: true }
        );
      }
    }
    
    res.status(200).json({ message: 'Logout successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
