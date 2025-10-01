const { 
  getActivePackage, 
  hasFeatureAccess, 
  cancelUserPackage,
  extendUserPackage,
  getPackageStats
} = require('../services/packageService');
const User = require('../models/User');
const { formatVN, formatPackageExpiry, now, isBefore } = require('../utils/dateHelper');

// Lấy gói active của user hiện tại
exports.getMyActivePackage = async (req, res) => {
  try {
    const userId = req.user._id;
    const activePackage = await getActivePackage(userId);
    
    if (!activePackage) {
      return res.json({
        message: 'Bạn chưa có gói dịch vụ active',
        hasActivePackage: false,
        data: null
      });
    }

    res.json({
      message: 'Gói dịch vụ active',
      hasActivePackage: true,
      data: {
        package: activePackage.packageId,
        startDate: activePackage.startDate,
        endDate: activePackage.endDate,
        features: activePackage.features,
        isActive: activePackage.isActive,
        daysRemaining: Math.ceil((activePackage.endDate - now().toDate()) / (1000 * 60 * 60 * 24)),
        formattedStartDate: formatVN(activePackage.startDate),
        formattedEndDate: formatPackageExpiry(activePackage.endDate)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Kiểm tra quyền sử dụng feature
exports.checkFeatureAccess = async (req, res) => {
  try {
    const userId = req.user._id;
    const { feature } = req.params;
    
    const hasAccess = await hasFeatureAccess(userId, feature);
    
    res.json({
      message: hasAccess ? 'Có quyền sử dụng' : 'Không có quyền sử dụng',
      hasAccess,
      feature
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy lịch sử gói của user
exports.getMyPackageHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Lấy lịch sử thanh toán của user
    const Payment = require('../models/Payment');
    const payments = await Payment.find({ 
      userId: userId,
      status: 'PAID'
    })
    .populate('packageId', 'name price duration unit features')
    .sort({ paidAt: -1 });

    res.json({
      message: 'Lịch sử gói dịch vụ',
      data: payments.map(payment => ({
        orderCode: payment.orderCode,
        package: payment.packageId,
        amount: payment.amount,
        paidAt: payment.paidAt,
        formattedPaidAt: formatVN(payment.paidAt),
        status: payment.status
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// ========== ADMIN APIs ==========

// Hủy gói của user (Admin)
exports.cancelUserPackage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được truy cập' });
    }

    const { userId } = req.params;
    const user = await cancelUserPackage(userId);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({
      message: 'Hủy gói thành công',
      data: {
        userId: user._id,
        userName: user.fullName,
        packageStatus: user.activePackage.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Gia hạn gói của user (Admin)
exports.extendUserPackage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được truy cập' });
    }

    const { userId } = req.params;
    const { additionalDuration, unit } = req.body;

    if (!additionalDuration || !unit) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin gia hạn (additionalDuration, unit)' 
      });
    }

    const user = await extendUserPackage(userId, additionalDuration, unit);

    res.json({
      message: 'Gia hạn gói thành công',
      data: {
        userId: user._id,
        userName: user.fullName,
        newEndDate: user.activePackage.endDate,
        formattedNewEndDate: formatPackageExpiry(user.activePackage.endDate),
        packageName: user.activePackage.packageId.name
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Thống kê gói (Admin)
exports.getPackageStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được truy cập' });
    }

    const stats = await getPackageStats();

    res.json({
      message: 'Thống kê gói dịch vụ',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Lấy thông tin chi tiết user và gói (Admin)
exports.getUserPackageInfo = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được truy cập' });
    }

    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('activePackage.packageId', 'name price duration unit features');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({
      message: 'Thông tin gói của user',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber
        },
        activePackage: user.activePackage,
        daysRemaining: user.activePackage.isActive && user.activePackage.endDate 
          ? Math.ceil((user.activePackage.endDate - now().toDate()) / (1000 * 60 * 60 * 24))
          : 0,
        formattedStartDate: user.activePackage.startDate ? formatVN(user.activePackage.startDate) : null,
        formattedEndDate: user.activePackage.endDate ? formatPackageExpiry(user.activePackage.endDate) : null
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi server',
      error: error.message
    });
  }
};
