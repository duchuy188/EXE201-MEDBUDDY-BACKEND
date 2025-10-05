const { hasFeatureAccess } = require("../services/packageService");
const { body } = require("express-validator");
const { validate } = require("../utils/validators");
const { create } = require("../models/Package");

// Middleware kiểm tra user có gói active không
const requireActivePackage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { getActivePackage } = require("../services/packageService");

    const activePackage = await getActivePackage(userId);

    if (!activePackage) {
      return res.status(403).json({
        message: "Bạn cần có gói dịch vụ active để sử dụng tính năng này",
        hasActivePackage: false,
        error: "NO_ACTIVE_PACKAGE",
      });
    }

    // Thêm thông tin package vào request
    req.activePackage = activePackage;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Lỗi kiểm tra gói dịch vụ",
      error: error.message,
    });
  }
};

const createPackageValidator = validate([
  body("name")
    .notEmpty()
    .withMessage("Tên gói không được để trống")
    .isLength({ min: 3 })
    .withMessage("Tên gói phải có ít nhất 3 ký tự"),

  body("description").optional().isString().withMessage("Mô tả phải là chuỗi"),

  body("price")
    .notEmpty()
    .withMessage("Giá không được để trống")
    .isFloat({ gt: 0 })
    .withMessage("Giá phải là số > 0"),

  body("duration")
    .notEmpty()
    .withMessage("Thời hạn không được để trống")
    .isInt({ gt: 0 })
    .withMessage("Thời hạn phải là số nguyên dương"),

  body("unit")
    .notEmpty()
    .withMessage("Đơn vị không được để trống")
    .isIn(["day", "month", "year"])
    .withMessage("Đơn vị phải là 'day', 'month' hoặc 'year'"),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features phải là mảng")
    .custom((arr) => arr.every((item) => typeof item === "string"))
    .withMessage("Mỗi feature phải là chuỗi"),
]);

const updatePackageValidator = validate([
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Tên gói phải có ít nhất 3 ký tự"),

  body("description").optional().isString().withMessage("Mô tả phải là chuỗi"),

  body("price").optional().isFloat({ gt: 0 }).withMessage("Giá phải là số > 0"),

  body("duration")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Thời hạn phải là số nguyên dương"),

  body("unit")
    .optional()
    .isIn(["day", "month", "year"])
    .withMessage("Đơn vị phải là 'day', 'month' hoặc 'year'"),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features phải là mảng")
    .custom((arr) => arr.every((item) => typeof item === "string"))
    .withMessage("Mỗi feature phải là chuỗi"),
]);

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
          error: "FEATURE_ACCESS_DENIED",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: "Lỗi kiểm tra quyền sử dụng tính năng",
        error: error.message,
      });
    }
  };
};

// Middleware kiểm tra gói sắp hết hạn (cảnh báo)
const checkPackageExpiry = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { getActivePackage } = require("../services/packageService");

    const activePackage = await getActivePackage(userId);

    if (activePackage) {
      const daysRemaining = Math.ceil(
        (activePackage.endDate - new Date()) / (1000 * 60 * 60 * 24)
      );

      // Cảnh báo nếu còn 7 ngày hoặc ít hơn
      if (daysRemaining <= 7) {
        req.packageWarning = {
          daysRemaining,
          endDate: activePackage.endDate,
          message:
            daysRemaining <= 0
              ? "Gói dịch vụ của bạn đã hết hạn"
              : `Gói dịch vụ của bạn sắp hết hạn trong ${daysRemaining} ngày`,
        };
      }
    }

    next();
  } catch (error) {
    // Không block request nếu có lỗi kiểm tra expiry
    console.error("Error checking package expiry:", error);
    next();
  }
};

// Middleware kiểm tra gói premium (chỉ cho gói trả phí)
const requirePremiumPackage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { getActivePackage } = require("../services/packageService");

    const activePackage = await getActivePackage(userId);

    if (!activePackage) {
      return res.status(403).json({
        message: "Bạn cần có gói dịch vụ active để sử dụng tính năng này",
        hasActivePackage: false,
        error: "NO_ACTIVE_PACKAGE",
      });
    }

    // Kiểm tra gói có phải trả phí không (price > 0)
    if (activePackage.packageId.price <= 0) {
      return res.status(403).json({
        message: "Tính năng này chỉ dành cho gói trả phí",
        hasPremiumPackage: false,
        currentPackage: activePackage.packageId.name,
        error: "PREMIUM_REQUIRED",
      });
    }

    req.activePackage = activePackage;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Lỗi kiểm tra gói premium",
      error: error.message,
    });
  }
};

module.exports = {
  requireActivePackage,
  requireFeature,
  checkPackageExpiry,
  requirePremiumPackage,
  createPackageValidator,
  updatePackageValidator,
};
