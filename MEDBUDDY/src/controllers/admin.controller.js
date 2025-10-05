const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { runPackageExpiryCheck, runPackageExpiringSoonCheck } = require('../jobs/packageExpiryJob');

// Dashboard admin
exports.dashboard = async (req, res) => {
  try {
    // Thống kê tổng quan
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalRelatives = await User.countDocuments({ role: 'relative' });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const activePackageUsers = await User.countDocuments({ 'activePackage.isActive': true });

    res.json({
      message: 'Dashboard admin',
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          patients: totalPatients,
          relatives: totalRelatives,
          blocked: blockedUsers,
          withActivePackage: activePackageUsers
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy tất cả users với pagination và filtering
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtering options
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isBlocked !== undefined) filter.isBlocked = req.query.isBlocked === 'true';
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phoneNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('activePackage.packageId', 'name price duration unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      message: 'Danh sách users',
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy thông tin user theo ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select('-password')
      .populate('activePackage.packageId', 'name price duration unit features');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({
      message: 'Thông tin user',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Tạo user mới
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role, dateOfBirth } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // Kiểm tra phoneNumber đã tồn tại
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

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
      message: 'Tạo user thành công',
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Cập nhật thông tin user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Không cho phép cập nhật password qua API này
    delete updateData.password;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .populate('activePackage.packageId', 'name price duration unit');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({
      message: 'Cập nhật user thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Block user
exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const user = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
        blockedAt: new Date(),
        blockedBy: adminId
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({
      message: 'Block user thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
        blockedAt: null,
        blockedBy: null
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({
      message: 'Unblock user thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// ========== PACKAGE MANAGEMENT ==========

// Chạy kiểm tra gói hết hạn thủ công
exports.runPackageExpiryCheck = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được truy cập' });
    }

    const expiredUsers = await runPackageExpiryCheck();

    res.json({
      message: 'Kiểm tra gói hết hạn hoàn thành',
      data: {
        expiredCount: expiredUsers.length,
        expiredUsers: expiredUsers.map(user => ({
          userId: user._id,
          userName: user.fullName,
          userEmail: user.email,
          packageName: user.activePackage.packageId.name,
          endDate: user.activePackage.endDate
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Chạy kiểm tra gói sắp hết hạn thủ công
exports.runPackageExpiringSoonCheck = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được truy cập' });
    }

    const expiringUsers = await runPackageExpiringSoonCheck();

    res.json({
      message: 'Kiểm tra gói sắp hết hạn hoàn thành',
      data: {
        expiringCount: expiringUsers.length,
        expiringUsers: expiringUsers.map(user => ({
          userId: user._id,
          userName: user.fullName,
          userEmail: user.email,
          packageName: user.activePackage.packageId.name,
          endDate: user.activePackage.endDate,
          daysRemaining: Math.ceil((user.activePackage.endDate - new Date()) / (1000 * 60 * 60 * 24))
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};