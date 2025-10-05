const Package = require("../models/Package");
const Payment = require("../models/Payment");

exports.isPaidUser = async (req, res, next) => {
  try {
    // chắc chắn đã có user mới qua được đây
    const user = req.user;

    const packageName = [
      "GÓI HAP DÙNG THỬ",
      "GÓI HAP+ CƠ BẢN",
      "GÓI HAP+ NÂNG CAO",
    ];

    const packages = await Package.find({
      name: { $in: packageName },
    });

    const isPaid = packages.some(
      async (pkg) =>
        await Payment.find({ userId: user._id, packageId: pkg._id })
    );

    if (!isPaid) {
      return res.status(403).json({
        message: "Tài khoản chưa đăng ký gói trả phí",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi kiểm tra gói dịch vụ",
    });
  }
};
