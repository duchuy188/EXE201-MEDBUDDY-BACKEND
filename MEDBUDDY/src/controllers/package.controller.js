const Package = require("../models/Package");

// Tạo các gói dịch vụ mặc định
exports.createDefaultPackages = async (req, res) => {
  try {
    const result = await Package.create(req.body);
    // const existed = await Package.find();
    // if (existed && existed.length > 0) {
    //   return res.status(400).json({ message: 'Đã có các gói dịch vụ, không thể tạo lại.' });
    // }
    // const features = [
    //   'Biểu đồ huyết áp hàng tuần',
    //   'Cảnh báo huyết áp bất thường',
    //   'Phân tích đơn thuốc',
    //   'Hẹn tái khám',
    // ];
    // const packages = [
    //   {
    //     name: 'GÓI HAP DÙNG THỬ',
    //     description: 'Gói dùng thử miễn phí trong 1 tuần đầu tiên',
    //     price: 0,
    //     duration: 7,
    //     unit: 'day',
    //     features,
    //   },
    //   {
    //     name: 'GÓI HAP+ CƠ BẢN',
    //     description: 'Gói cơ bản sử dụng AI nhận diện hóa đơn, thanh toán theo tháng',
    //     price: 19000,
    //     duration: 1,
    //     unit: 'month',
    //     features,
    //   },
    //   {
    //     name: 'GÓI HAP+ NÂNG CAO',
    //     description: 'Gói nâng cao sử dụng AI nhận diện hóa đơn, thanh toán theo năm',
    //     price: 199000,
    //     duration: 1,
    //     unit: 'year',
    //     features,
    //   },
    // ];
    // const result = await Package.insertMany(packages);
    return res
      .status(201)
      .json({ message: "Tạo gói dịch vụ thành công", data: result });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Chỉnh sửa gói dịch vụ (chỉ admin)
exports.updatePackage = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ admin mới được chỉnh sửa gói dịch vụ." });
    }
    const { id } = req.params;
    const updateData = req.body;
    const pkg = await Package.findByIdAndUpdate(id, updateData, { new: true });
    if (!pkg) {
      return res.status(404).json({ message: "Không tìm thấy gói dịch vụ." });
    }
    return res.json({ message: "Cập nhật gói dịch vụ thành công", data: pkg });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Thêm mới gói dịch vụ (chỉ admin)
exports.addPackage = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ admin mới được thêm gói dịch vụ." });
    }
    const pkg = await Package.create(req.body);
    return res
      .status(201)
      .json({ message: "Thêm gói dịch vụ thành công", data: pkg });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Xóa gói dịch vụ (chỉ admin)
exports.deletePackage = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ admin mới được xóa gói dịch vụ." });
    }
    const { id } = req.params;
    const pkg = await Package.findByIdAndDelete(id);
    if (!pkg) {
      return res.status(404).json({ message: "Không tìm thấy gói dịch vụ." });
    }
    return res.json({ message: "Xóa gói dịch vụ thành công" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy danh sách tất cả các gói dịch vụ
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    return res.json({ data: packages });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
