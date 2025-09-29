const RelativePatient = require('../models/RelativePatient');
const User = require('../models/User');
const { sendInviteEmail } = require('../services/inviteEmailService');
const Package = require('../models/Package');

// API khởi tạo 3 gói dịch vụ đúng UI
exports.createDefaultPackages = async (req, res) => {
  try {
    // Kiểm tra đã có gói chưa
    const existed = await Package.find();
    if (existed && existed.length > 0) {
      return res.status(400).json({ message: 'Đã có các gói dịch vụ, không thể tạo lại.' });
    }
    const features = [
      'Biểu đồ huyết áp hàng tuần',
      'Cảnh báo huyết áp bất thường',
      'Phân tích đơn thuốc',
      'Hẹn tái khám',
    ];
    const packages = [
      {
        name: 'GÓI HAP DÙNG THỬ',
        description: 'Gói dùng thử miễn phí trong 1 tuần đầu tiên',
        price: 0,
        duration: 7,
        unit: 'day',
        features,
      },
      {
        name: 'GÓI HAP+ CƠ BẢN',
        description: 'Gói cơ bản sử dụng AI nhận diện hóa đơn, thanh toán theo tháng',
        price: 19000,
        duration: 1,
        unit: 'month',
        features,
      },
      {
        name: 'GÓI HAP+ NÂNG CAO',
        description: 'Gói nâng cao sử dụng AI nhận diện hóa đơn, thanh toán theo năm',
        price: 199000,
        duration: 1,
        unit: 'year',
        features,
      },
    ];
    const result = await Package.insertMany(packages);
    return res.status(201).json({ message: 'Tạo gói dịch vụ thành công', data: result });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
}

// Thêm liên kết giữa người thân và người bệnh
exports.addRelativePatient = async (req, res) => {
  try {
    const { email } = req.body;
    // Kiểm tra người gửi request phải là patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Chỉ người bệnh mới có thể thêm người thân.' });
    }
    const patientId = req.user._id;

    // Tìm người thân theo email
    const relative = await User.findOne({ email, role: 'relative' });
    if (!relative) {
      return res.status(404).json({ message: 'Không tìm thấy người thân với email này.' });
    }

    // Kiểm tra đã tồn tại liên kết chưa
    const existed = await RelativePatient.findOne({ patient: patientId, relative: relative._id });
    if (existed) {
      return res.status(400).json({ message: 'Đã tồn tại liên kết.' });
    }

    // Sinh OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Tạo liên kết với trạng thái pending và lưu OTP
    const newLink = await RelativePatient.create({ patient: patientId, relative: relative._id, status: 'pending', otp, otpExpiresAt });

    // Gửi email thông báo tới người thân
    await sendInviteEmail(relative.email, relative.fullName, req.user.fullName, `Mã OTP xác nhận liên kết: <b>${otp}</b>`);

    return res.status(201).json({ message: 'Đã gửi mã OTP xác nhận tới email người bệnh.', linkId: newLink._id });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xác nhận liên kết bằng OTP
exports.confirmRelativePatient = async (req, res) => {
  try {
    const { linkId, otp } = req.body;
    const link = await RelativePatient.findById(linkId);
    if (!link) {
      return res.status(404).json({ message: 'Không tìm thấy liên kết.' });
    }
    if (link.status !== 'pending') {
      return res.status(400).json({ message: 'Liên kết đã được xác nhận hoặc bị từ chối.' });
    }
    if (!link.otp || !link.otpExpiresAt || link.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn.' });
    }
    if (link.otp !== otp) {
      return res.status(400).json({ message: 'Mã OTP không đúng.' });
    }
    link.status = 'accepted';
    link.otp = undefined;
    link.otpExpiresAt = undefined;
    await link.save();
    return res.json({ message: 'Xác nhận liên kết thành công.' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách người bệnh của người thân
exports.getPatientsOfRelative = async (req, res) => {
  try {
    const relativeId = req.user._id;
    const links = await RelativePatient.find({ relative: relativeId, status: 'accepted' }).populate('patient');
    // Trả về cả _id của liên kết và thông tin patient
    return res.json(links.map(l => ({
      _id: l._id,
      patient: l.patient
    })));
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách người thân của người bệnh
exports.getRelativesOfPatient = async (req, res) => {
  try {
    const patientId = req.user._id;
    const links = await RelativePatient.find({ patient: patientId, status: 'accepted' }).populate('relative');
    // Trả về cả _id của liên kết và thông tin relative
    return res.json(links.map(l => ({
      _id: l._id,
      relative: l.relative
    })));
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa liên kết giữa người bệnh và người thân
exports.deleteRelativePatient = async (req, res) => {
  try {
    const { linkId } = req.body;
    const link = await RelativePatient.findById(linkId);
    if (!link) {
      return res.status(404).json({ message: 'Không tìm thấy liên kết.' });
    }
    // Chỉ cho phép patient hoặc relative liên quan xóa liên kết
    if (!link.patient.equals(req.user._id) && !link.relative.equals(req.user._id)) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa liên kết này.' });
    }
    await link.deleteOne();
    return res.json({ message: 'Xóa liên kết thành công.' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Người thân thêm người bệnh
exports.addPatientForRelative = async (req, res) => {
  try {
    const { email } = req.body;
    // Kiểm tra người gửi request phải là relative
    if (req.user.role !== 'relative') {
      return res.status(403).json({ message: 'Chỉ người thân mới có thể thêm người bệnh.' });
    }
    const relativeId = req.user._id;

    // Tìm người bệnh theo email
    const patient = await User.findOne({ email, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ message: 'Không tìm thấy người bệnh với email này.' });
    }

    // Kiểm tra đã tồn tại liên kết chưa
    const existed = await RelativePatient.findOne({ patient: patient._id, relative: relativeId });
    if (existed) {
      if (existed.status === 'pending') {
        return res.status(400).json({ message: 'Đã gửi lời mời, đang chờ xác nhận.' });
      }
      if (existed.status === 'accepted') {
        return res.status(400).json({ message: 'Đã tồn tại liên kết.' });
      }
    }

    // Sinh OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Tạo liên kết với trạng thái pending và lưu OTP
    const newLink = await RelativePatient.create({ patient: patient._id, relative: relativeId, status: 'pending', otp, otpExpiresAt });

    // Gửi email thông báo tới người bệnh
    await sendInviteEmail(patient.email, patient.fullName, req.user.fullName, `Mã OTP xác nhận liên kết: <b>${otp}</b>`);

    return res.status(201).json({ message: 'Đã gửi mã OTP xác nhận tới email người bệnh.', linkId: newLink._id });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// API chỉnh sửa gói dịch vụ (chỉ admin)
exports.updatePackage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được chỉnh sửa gói dịch vụ.' });
    }
    const { id } = req.params;
    const updateData = req.body;
    const pkg = await Package.findByIdAndUpdate(id, updateData, { new: true });
    if (!pkg) {
      return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ.' });
    }
    return res.json({ message: 'Cập nhật gói dịch vụ thành công', data: pkg });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
