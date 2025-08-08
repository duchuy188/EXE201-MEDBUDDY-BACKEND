
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// Lấy tất cả user
router.get("/all", authMiddleware, userController.getAllUsers);

// Lấy profile của chính user đã đăng nhập
router.get("/profile", authMiddleware, userController.getProfile);

// Cập nhật profile (không cho sửa role)
router.put("/profile", authMiddleware, upload.single("avatar"), userController.updateProfile);

// Đổi mật khẩu
router.post("/change-password", authMiddleware, userController.changePassword);

// Xóa avatar
router.delete("/remove-avatar", authMiddleware, userController.removeAvatar);

// Dashboard test quyền
router.get("/dashboard", authMiddleware, userController.dashboard);

module.exports = router;
