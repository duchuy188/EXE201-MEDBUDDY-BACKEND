const express = require("express");

const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const remindersController = require("../controllers/reminders.controller");
const { isPaidUser } = require("../middlewares/ocr.middleware");

// GET /reminders – Danh sách nhắc uống thuốc
router.get("/", authMiddleware, remindersController.getReminders);

// POST /reminders – Thêm nhắc uống thuốc
router.post(
  "/",
  authMiddleware,
  isPaidUser,
  remindersController.createReminder
);

// GET /reminders/:id – Xem chi tiết nhắc nhở
router.get("/:id", authMiddleware, remindersController.getReminderById);

// PUT /reminders/:id – Cập nhật nhắc nhở
router.put(
  "/:id",
  authMiddleware,
  isPaidUser,
  remindersController.updateReminder
);

// DELETE /reminders/:id – Xóa nhắc nhở
router.delete("/:id", authMiddleware, remindersController.deleteReminder);

module.exports = router;
