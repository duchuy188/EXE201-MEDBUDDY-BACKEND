// Quản trị hệ thống
const User = require('../models/User');

// Dashboard admin - placeholder
exports.dashboard = (req, res) => {
  res.json({ 
    message: `Xin chào Admin ${req.user.fullName}`,
    role: req.user.role 
  });
};

// Lấy tất cả users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      message: 'Danh sách tất cả người dùng',
      users
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};
