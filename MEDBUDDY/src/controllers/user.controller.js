const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { uploadImage } = require("../services/uploadService");

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
};

// User update profile của chính mình (không được sửa role)
exports.updateProfile = async (req, res) => {
  // Kiểm tra req.body trước khi destructure
  if (!req.body) {
    return res.status(400).json({ message: "Thiếu dữ liệu gửi lên" });
  }

  const { fullName, email, phoneNumber, dateOfBirth, ...otherFields } = req.body;
  const avatarFile = req.file; // Lấy file avatar từ multer

  // Không cho phép sửa role
  if (otherFields.role) {
    return res.status(400).json({
      message: "Không được phép thay đổi role của bản thân",
    });
  }

  // Không cho phép sửa các field khác không được định nghĩa (bỏ qua avatar)
  const allowedFields = ["fullName", "email", "phoneNumber", "dateOfBirth"];
  const invalidFields = Object.keys(otherFields).filter(f => f !== "avatar" && f !== "role");
  if (invalidFields.length > 0) {
    return res.status(400).json({
      message: "Chỉ được cập nhật fullName, email, phoneNumber, password, dateOfBirth, avatar",
    });
  }

  try {
    const updateFields = {};

    // Chỉ cập nhật các field được phép
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (email !== undefined) updateFields.email = email;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
  // Không cho phép cập nhật password ở đây

    // Xử lý upload avatar nếu có
    if (avatarFile) {
      try {
        const result = await uploadImage(avatarFile.buffer);
        updateFields.avatar = result.secure_url;
      } catch (uploadError) {
        console.error("Lỗi upload avatar:", uploadError);
        return res.status(400).json({ message: "Lỗi upload avatar" });
      }
    }

    // Kiểm tra email đã tồn tại chưa (nếu có thay đổi email)
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true }
    ).select("-password");

    res.json({
      message: "Cập nhật profile thành công",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi cập nhật profile",
      error: err.message,
    });
  }
};

// User thay đổi mật khẩu
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({
      message:
        "Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới",
    });
  }

  // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới có khớp nhau không
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({
      message: "Mật khẩu mới và xác nhận mật khẩu mới không khớp nhau",
    });
  }

  // Kiểm tra mật khẩu mới không được trùng với mật khẩu cũ
  if (currentPassword === newPassword) {
    return res.status(400).json({
      message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    });
  }

  try {
    // Lấy thông tin user hiện tại (bao gồm password đã hash)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra mật khẩu hiện tại có đúng không
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới
    await User.findByIdAndUpdate(req.user._id, {
      password: hashedNewPassword,
    });

    res.json({
      message: "Thay đổi mật khẩu thành công",
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi thay đổi mật khẩu",
      error: err.message,
    });
  }
};

// User xóa avatar
exports.removeAvatar = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: null },
      { new: true }
    ).select("-password");

    res.json({
      message: "Xóa avatar thành công",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi xóa avatar",
      error: err.message,
    });
  }
};

exports.dashboard = (req, res) => {
  res.json({ message: `Xin chào ${req.user.role}` });
};
