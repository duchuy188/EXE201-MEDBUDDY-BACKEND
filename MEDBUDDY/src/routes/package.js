const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller");
const payosController = require("../controllers/payos.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createPackageValidator,
  updatePackageValidator,
} = require("../middlewares/packageAccess.middleware");
const { filterMiddleware } = require("../middlewares/common.middleware");

// Tạo các gói dịch vụ mặc định
router.post(
  "/create",
  filterMiddleware([
    "name",
    "description",
    "price",
    "duration",
    "unit",
    "features",
  ]),
  authMiddleware,
  createPackageValidator,
  packageController.createDefaultPackages
);

// Chỉnh sửa gói dịch vụ (chỉ admin)
router.put(
  "/:id",
  authMiddleware,
  filterMiddleware([
    "name",
    "description",
    "price",
    "duration",
    "unit",
    "features",
  ]),
  updatePackageValidator,
  packageController.updatePackage
);

// Thêm mới gói dịch vụ (chỉ admin)
router.post(
  "/",
  authMiddleware,
  filterMiddleware([
    "name",
    "description",
    "price",
    "duration",
    "unit",
    "features",
  ]),
  packageController.addPackage
);
// Xóa gói dịch vụ (chỉ admin)
router.delete("/:id", authMiddleware, packageController.deletePackage);
// Lấy danh sách tất cả các gói dịch vụ
router.get("/", packageController.getAllPackages);
// Kích hoạt gói dùng thử miễn phí
router.post(
  "/activate-trial",
  authMiddleware,
  payosController.activateTrialPackage
);

module.exports = router;
