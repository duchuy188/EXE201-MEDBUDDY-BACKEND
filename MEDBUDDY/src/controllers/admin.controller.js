
const User = require('../models/User');
const bcrypt = require('bcrypt');


exports.dashboard = (req, res) => {
  res.json({ 
    message: `Xin chào Admin ${req.user.fullName}`,
    role: req.user.role 
  });
};

// Lấy tất cả users với phân trang và filter (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const isBlocked = req.query.isBlocked;
    

    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-password')
      .populate('blockedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      message: 'Danh sách người dùng',
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Lấy chi tiết 1 user (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('blockedBy', 'fullName email');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({
      message: 'Thông tin người dùng',
      user
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Tạo user mới (admin only)
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role, dateOfBirth } = req.body;
    
    if (!fullName || !email || !phoneNumber || !password || !role || !dateOfBirth) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    if (!['relative', 'patient', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }
    
  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    
   
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      fullName, 
      email, 
      phoneNumber, 
      password: hashedPassword, 
      role, 
      dateOfBirth 
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'Tạo người dùng thành công',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Cập nhật user 
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, role, dateOfBirth, isBlocked } = req.body;
    const userId = req.params.id;
    
 
    if (userId === req.user._id.toString() && isBlocked === true) {
      return res.status(400).json({ message: 'Không thể block chính mình' });
    }
    
    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (email !== undefined) updateFields.email = email;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (role !== undefined) updateFields.role = role;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
    if (isBlocked !== undefined) {
      updateFields.isBlocked = isBlocked;
      if (isBlocked) {
        updateFields.blockedAt = new Date();
        updateFields.blockedBy = req.user._id;
      } else {
        updateFields.blockedAt = null;
        updateFields.blockedBy = null;
      }
    }
    
   
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
      }
    }
    
    
    if (phoneNumber) {
      const existingPhone = await User.findOne({
        phoneNumber,
        _id: { $ne: userId }
      });
      if (existingPhone) {
        return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    ).select('-password').populate('blockedBy', 'fullName email');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({
      message: 'Cập nhật người dùng thành công',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Block user (admin only)
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
  
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể block chính mình' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    if (user.isBlocked) {
      return res.status(400).json({ message: 'Người dùng đã bị block' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
        blockedAt: new Date(),
        blockedBy: req.user._id
      },
      { new: true }
    ).select('-password').populate('blockedBy', 'fullName email');
    
    res.json({
      message: 'Block người dùng thành công',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// Unblock user (admin only)
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    if (!user.isBlocked) {
      return res.status(400).json({ message: 'Người dùng chưa bị block' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
        blockedAt: null,
        blockedBy: null
      },
      { new: true }
    ).select('-password');
    
    res.json({
      message: 'Unblock người dùng thành công',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};
