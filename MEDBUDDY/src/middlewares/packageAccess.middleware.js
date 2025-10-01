const { hasFeatureAccess } = require('../services/packageService');

// Middleware kiểm tra user có gói active không
const requireActivePackage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { getActivePackage } = require('../services/packageService');
    
    const activePackage = await getActivePackage(userId);
    
    if (!activePackage) {
      return res.status(403).json({
        message: 'Bạn cần có gói dịch vụ active để sử dụng tính năng này',
        hasActivePackage: false,
        error: 'NO_ACTIVE_PACKAGE'
      });
    }

    // Thêm thông tin package vào request
    req.activePackage = activePackage;
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi kiểm tra gói dịch vụ',
      error: error.message
    });
  }
};

// Middleware kiểm tra quyền sử dụng feature cụ thể
const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      
      const hasAccess = await hasFeatureAccess(userId, feature);
      
      if (!hasAccess) {
        return res.status(403).json({
          message: `Bạn không có quyền sử dụng tính năng: ${feature}`,
          hasAccess: false,
          requiredFeature: feature,
          error: 'FEATURE_ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi kiểm tra quyền sử dụng tính năng',
        error: error.message
      });
    }
  };
};

// Middleware kiểm tra gói sắp hết hạn (cảnh báo)
const checkPackageExpiry = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { getActivePackage } = require('../services/packageService');
    
    const activePackage = await getActivePackage(userId);
    
    if (activePackage) {
      const daysRemaining = Math.ceil((activePackage.endDate - new Date()) / (1000 * 60 * 60 * 24));
      
      // Cảnh báo nếu còn 7 ngày hoặc ít hơn
      if (daysRemaining <= 7) {
        req.packageWarning = {
          daysRemaining,
          endDate: activePackage.endDate,
          message: daysRemaining <= 0 
            ? 'Gói dịch vụ của bạn đã hết hạn' 
            : `Gói dịch vụ của bạn sắp hết hạn trong ${daysRemaining} ngày`
        };
      }
    }

    next();
  } catch (error) {
    // Không block request nếu có lỗi kiểm tra expiry
    console.error('Error checking package expiry:', error);
    next();
  }
};

// Middleware kiểm tra gói premium (chỉ cho gói trả phí)
const requirePremiumPackage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { getActivePackage } = require('../services/packageService');
    
    const activePackage = await getActivePackage(userId);
    
    if (!activePackage) {
      return res.status(403).json({
        message: 'Bạn cần có gói dịch vụ active để sử dụng tính năng này',
        hasActivePackage: false,
        error: 'NO_ACTIVE_PACKAGE'
      });
    }

    // Kiểm tra gói có phải trả phí không (price > 0)
    if (activePackage.packageId.price <= 0) {
      return res.status(403).json({
        message: 'Tính năng này chỉ dành cho gói trả phí',
        hasPremiumPackage: false,
        currentPackage: activePackage.packageId.name,
        error: 'PREMIUM_REQUIRED'
      });
    }

    req.activePackage = activePackage;
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi kiểm tra gói premium',
      error: error.message
    });
  }
};

module.exports = {
  requireActivePackage,
  requireFeature,
  checkPackageExpiry,
  requirePremiumPackage
};
