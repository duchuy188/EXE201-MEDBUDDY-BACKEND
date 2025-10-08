const RelativePatient = require('../models/RelativePatient');
const User = require('../models/User');
const { sendInviteEmail } = require('../services/inviteEmailService');
const Package = require('../models/Package');
const Reminder = require('../models/Reminder');
const Appointment = require('../models/Appointment');
const Medication = require('../models/Medication');
const BloodPressure = require('../models/BloodPressure');
const medicationHistoryController = require('./medicationHistory.controller');
const { getActivePackage, hasFeatureAccess } = require('../services/packageService');
const { now, formatVN, formatPackageExpiry } = require('../utils/dateHelper');
const Payment = require('../models/Payment');
const { sendPaymentConfirmationEmail, sendPaymentFailureEmail } = require('../services/paymentEmailService');
const { activateUserPackage } = require('../services/packageService');
const Tesseract = require('tesseract.js');
const { uploadImage } = require('../services/uploadService');

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
    link.permissions = ['view_medical_records', 'schedule_medication', 'schedule_appointment'];
    link.otp = undefined;
    link.otpExpiresAt = undefined;
    await link.save();
    return res.json({ message: 'Xác nhận liên kết thành công.' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// API lấy danh sách người bệnh của người thân
exports.getPatientsOfRelative = async (req, res) => {
  try {
    const relativeId = req.user._id;
    const links = await RelativePatient.find({ relative: relativeId, status: 'accepted' }).populate('patient');
    // Trả về cả _id của liên kết và thông tin patient, bao gồm permissions
    return res.json(links.map(l => ({
      _id: l._id,
      patient: l.patient,
      permissions: l.permissions || [] // Đảm bảo trả về permissions
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

// Helper function để kiểm tra quyền của người thân
const checkRelativePermission = async (patientId, relativeId, userRole) => {
  // Kiểm tra người dùng phải là relative
  if (userRole !== 'relative') {
    console.log(`checkRelativePermission: caller role=${userRole} is not 'relative'`);
    throw new Error('Chỉ người thân mới có quyền thực hiện hành động này');
  }

  console.log(`checkRelativePermission: looking for relationship patient=${patientId} relative=${relativeId}`);
  const relationship = await RelativePatient.findOne({
    patient: patientId,
    relative: relativeId,
    status: 'accepted'
  });

  if (!relationship) {
    console.log('checkRelativePermission: no accepted relationship found');
    throw new Error('Bạn không có quyền thực hiện hành động này cho bệnh nhân');
  }

  console.log('checkRelativePermission: relationship found, permissions=', relationship.permissions);
  return relationship;
};

// API đặt lịch uống thuốc cho bệnh nhân bởi người thân
exports.createMedicationReminderForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { medicationId, times, startDate, endDate, repeatTimes, note, reminderType, voice } = req.body;
    const relativeId = req.user._id;

    console.log('=== DEBUG CREATE MEDICATION REMINDER ===');
    console.log('User:', req.user);
    console.log('PatientId:', patientId);
    console.log('RelativeId:', relativeId);
    console.log('User Role:', req.user.role);

    // Kiểm tra người dùng phải là relative
    if (req.user.role !== 'relative') {
      console.log('❌ User role is not relative:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Chỉ người thân mới có quyền thực hiện hành động này'
      });
    }

    // Kiểm tra mối quan hệ
    const relationship = await RelativePatient.findOne({
      patient: patientId,
      relative: relativeId,
      status: 'accepted'
    });

    console.log('Relationship found:', relationship);

    if (!relationship) {
      console.log('❌ No relationship found');
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này cho bệnh nhân'
      });
    }

    console.log('Relationship permissions:', relationship.permissions);

    // Nếu permissions trống => từ chối (không tự động cấp quyền)
    if (!relationship.permissions || relationship.permissions.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Người thân chưa được cấp quyền. Vui lòng yêu cầu bệnh nhân cấp quyền trước khi thực hiện hành động này.'
      });
    }

    // Kiểm tra quyền schedule_medication
    if (!relationship.permissions || !relationship.permissions.includes('schedule_medication')) {
      console.log('❌ No schedule_medication permission. Current permissions:', relationship.permissions);
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền đặt lịch uống thuốc'
      });
    }

    // Kiểm tra medication có tồn tại không
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      console.log('❌ Medication not found:', medicationId);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thuốc'
      });
    }

    console.log('✅ All checks passed, creating reminder...');

    // Nếu reminderType là 'voice' thì mới kiểm tra feature 'Nhắc thuốc bằng giọng nói'
    if ((reminderType || 'normal') === 'voice') {
      try {
        const hasVoiceFeature = await hasFeatureAccess(patientId, 'Nhắc thuốc bằng giọng nói');
        if (!hasVoiceFeature) {
          return res.status(403).json({ success: false, message: 'Người bệnh chưa có gói "Nhắc thuốc bằng giọng nói". Vui lòng mua gói để sử dụng tính năng này.' });
        }
      } catch (fErr) {
        console.error('Error checking feature access for voice reminder:', fErr);
        // nếu lỗi khi kiểm tra feature, chặn thao tác để an toàn
        return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền tính năng của người bệnh' });
      }
    }

    // Tạo reminder mới
    const reminderData = {
      userId: patientId,
      medicationId,
      reminderType: reminderType || 'normal',
      times,
      startDate,
      endDate,
      repeatTimes,
      note: note || `Lịch uống thuốc được tạo bởi người thân: ${req.user.fullName}`,
      isActive: true,
      createdBy: req.user._id,
      createdByType: 'relative'
    };

    // Only set voice when reminderType is 'voice'
    if ((reminderType || 'normal') === 'voice') {
      reminderData.voice = voice || 'banmai';
    }

    const reminder = new Reminder(reminderData);

    await reminder.save();

    console.log('✅ Reminder created successfully:', reminder._id);

    res.json({
      success: true,
      message: 'Đặt lịch uống thuốc thành công',
      data: reminder
    });
  } catch (error) {
    console.error('❌ Error in createMedicationReminderForPatient:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API đặt lịch tái khám cho bệnh nhân bởi người thân
exports.createAppointmentForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { title, hospital, location, date, time, notes } = req.body;
    const relativeId = req.user._id;

    // Kiểm tra người dùng phải là relative
    if (req.user.role !== 'relative') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người thân mới có quyền thực hiện hành động này'
      });
    }

    // Kiểm tra mối quan hệ
    const relationship = await RelativePatient.findOne({
      patient: patientId,
      relative: relativeId,
      status: 'accepted'
    });

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này cho bệnh nhân'
      });
    }

    // Kiểm tra quyền schedule_appointment
    if (!relationship.permissions.includes('schedule_appointment')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền đặt lịch tái khám'
      });
    }

    // Kiểm tra feature của bệnh nhân: Hẹn tái khám
    try {
      const hasAppointmentFeature = await hasFeatureAccess(patientId, 'Hẹn tái khám');
      if (!hasAppointmentFeature) {
        return res.status(403).json({ success: false, message: 'Người bệnh chưa có gói dịch vụ. Vui lòng mua gói để sử dụng tính năng này.' });
      }
    } catch (fErr) {
      console.error('Error checking appointment feature access:', fErr);
      return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền tính năng của người bệnh' });
    }

    // Tạo appointment mới
    const appointment = new Appointment({
      title,
      hospital,
      location,
      date: new Date(date),
      time,
      notes: notes || `Lịch tái khám được tạo bởi người thân: ${req.user.fullName}`,
      userId: patientId,
      status: 'pending',
      createdBy: req.user._id,
      createdByType: 'relative'
    });

    await appointment.save();

    res.json({
      success: true,
      message: 'Đặt lịch tái khám thành công',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Người thân tạo link thanh toán để mua gói cho bệnh nhân
exports.createPaymentLinkForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    if (req.user.role !== 'relative') {
      return res.status(403).json({ message: 'Chỉ người thân mới có thể thực hiện thao tác này' });
    }

    // Kiểm tra mối quan hệ
    const relationship = await RelativePatient.findOne({ patient: patientId, relative: relativeId, status: 'accepted' });
    if (!relationship) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này cho bệnh nhân' });
    }

    const { packageId } = req.body;
    if (!packageId) return res.status(400).json({ message: 'Thiếu packageId' });

    const packageInfo = await Package.findById(packageId);
    if (!packageInfo) return res.status(404).json({ message: 'Package không tồn tại' });

    const scheme = 'medbuddy://';
    const orderCode = Date.now();
    const returnUrl = `${scheme}payment-success?orderCode=${orderCode}`;
    const cancelUrl = `${scheme}payment-cancel?orderCode=${orderCode}`;
    const order = {
      amount: packageInfo.price,
      description: packageInfo.name.length > 25 ? packageInfo.name.substring(0, 25) : packageInfo.name,
      orderCode,
      returnUrl,
      cancelUrl,
      items: [{
        name: packageInfo.name.length > 25 ? packageInfo.name.substring(0, 25) : packageInfo.name,
        quantity: 1,
        price: packageInfo.price
      }]
    };

    // require payOS lazily to avoid top-level require which needs env vars
    const payOS = require('../config/payos/payos.config');
    const paymentLinkResponse = await payOS.paymentRequests.create(order);

    const payment = new Payment({
      orderCode: paymentLinkResponse.orderCode,
      userId: patientId, // purchase is for patient
      packageId: packageId,
      amount: packageInfo.price,
      description: order.description,
      paymentUrl: paymentLinkResponse.checkoutUrl,
      status: 'PENDING'
    });
    // store who initiated the purchase (relative)
    payment.initiatedBy = relativeId;
    await payment.save();

    res.json({
      message: 'Tạo link thanh toán cho bệnh nhân thành công',
      paymentUrl: paymentLinkResponse.checkoutUrl,
      orderCode: paymentLinkResponse.orderCode
    });
  } catch (err) {
    console.error('Error in createPaymentLinkForPatient:', err);
    res.status(500).json({ message: 'Lỗi tạo link thanh toán', error: err.message });
  }
};

// Lấy gói active của bệnh nhân (cho người thân)
exports.getPatientActivePackage = async (req, res) => {
  try {
    const { patientId } = req.params;
    // Kiểm tra quan hệ và quyền
    await checkRelativePermission(patientId, req.user._id, req.user.role);

    const activePackage = await getActivePackage(patientId);
    if (!activePackage) {
      return res.json({ message: 'Người bệnh chưa có gói dịch vụ', hasActivePackage: false, data: null });
    }

    res.json({
      message: 'Gói dịch vụ active của người bệnh',
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
    if (error.message && error.message.includes('quyền')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Kiểm tra quyền sử dụng feature của bệnh nhân (cho người thân)
exports.checkPatientFeatureAccess = async (req, res) => {
  try {
    const { patientId, feature } = req.params;
    await checkRelativePermission(patientId, req.user._id, req.user.role);

    const hasAccess = await hasFeatureAccess(patientId, feature);
    res.json({ message: hasAccess ? 'Người bệnh có quyền sử dụng' : 'Người bệnh không có quyền sử dụng', hasAccess, feature });
  } catch (error) {
    if (error.message && error.message.includes('quyền')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy lịch sử gói của bệnh nhân (cho người thân)
exports.getPatientPackageHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log(`getPatientPackageHistory: called with patientId=${patientId} by user=${req.user ? req.user._id : 'anonymous'} role=${req.user ? req.user.role : 'unknown'}`);
    await checkRelativePermission(patientId, req.user._id, req.user.role);

    const payments = await Payment.find({ userId: patientId, status: 'PAID' })
      .populate('packageId', 'name price duration unit features')
      .sort({ paidAt: -1 });

    res.json({
      message: 'Lịch sử gói của người bệnh',
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
    if (error.message && error.message.includes('quyền')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// API lấy danh sách lịch uống thuốc của bệnh nhân (cho người thân xem)
exports.getPatientMedicationReminders = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    await checkRelativePermission(patientId, relativeId, req.user.role);

    const reminders = await Reminder.find({ 
      userId: patientId,
      isActive: true 
    })
    .populate('medicationId', 'name dosage')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// API lấy danh sách lịch tái khám của bệnh nhân (cho người thân xem)
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    await checkRelativePermission(patientId, relativeId, req.user.role);

    const appointments = await Appointment.find({ 
      userId: patientId 
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// API cập nhật lịch uống thuốc của bệnh nhân (bởi người thân)
exports.updatePatientMedicationReminder = async (req, res) => {
  try {
    const { patientId, reminderId } = req.params;
    const updateData = req.body;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    // Kiểm tra quyền schedule_medication
    if (!relationship.permissions.includes('schedule_medication')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật lịch uống thuốc'
      });
    }

    const reminder = await Reminder.findOne({
      _id: reminderId,
      userId: patientId
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch uống thuốc'
      });
    }

    // Prevent changing to voice reminder unless patient has the voice feature
    const newType = (updateData.reminderType || reminder.reminderType || 'normal');
    if (newType === 'voice') {
      try {
        const hasVoiceFeature = await hasFeatureAccess(patientId, 'Nhắc thuốc bằng giọng nói');
        if (!hasVoiceFeature) {
          return res.status(403).json({ success: false, message: 'Người bệnh chưa có gói "Nhắc thuốc bằng giọng nói". Vui lòng mua gói để sử dụng tính năng này.' });
        }
      } catch (fErr) {
        console.error('Error checking feature access for voice reminder update:', fErr);
        return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền tính năng của người bệnh' });
      }
    }

    // Only set voice when resulting reminder type is 'voice'
    if (newType === 'voice') {
      if (updateData.voice) reminder.voice = updateData.voice;
    } else {
      // if switching away from voice, remove voice field to avoid accidental preservation
      reminder.voice = undefined;
    }

    // Apply other updates (except voice and reminderType handled separately)
    const safeUpdates = { ...updateData };
    delete safeUpdates.voice;
    delete safeUpdates.reminderType;
    Object.assign(reminder, safeUpdates);
    // set reminderType explicitly
    reminder.reminderType = newType;
    await reminder.save();

    res.json({
      success: true,
      message: 'Cập nhật lịch uống thuốc thành công',
      data: reminder
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};


// API cập nhật lịch tái khám của bệnh nhân (bởi người thân)
exports.updatePatientAppointment = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const updateData = req.body;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    // Kiểm tra quyền schedule_appointment
    if (!relationship.permissions.includes('schedule_appointment')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật lịch tái khám'
      });
    }

    // Kiểm tra feature OCR của bệnh nhân
    try {
      const hasOcrFeature = await hasFeatureAccess(patientId, 'Phân tích đơn thuốc');
      if (!hasOcrFeature) {
        return res.status(403).json({ success: false, message: 'Người bệnh chưa có gói dịch vụ. Vui lòng mua gói để sử dụng tính năng này.' });
      }
    } catch (fErr) {
      console.error('Error checking OCR feature access:', fErr);
      return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền tính năng của người bệnh' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId: patientId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch tái khám'
      });
    }

    // Cập nhật appointment
    Object.assign(appointment, updateData);
    await appointment.save();

    res.json({
      success: true,
      message: 'Cập nhật lịch tái khám thành công',
      data: appointment
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// API xóa lịch uống thuốc của bệnh nhân (bởi người thân)
exports.deletePatientMedicationReminder = async (req, res) => {
  try {
    const { patientId, reminderId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    // Kiểm tra quyền schedule_medication
    if (!relationship.permissions.includes('schedule_medication')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa lịch uống thuốc'
      });
    }

    // Nếu reminder là voice, kiểm tra feature của bệnh nhân
    if (reminder.reminderType === 'voice') {
      const hasVoiceFeature = await hasFeatureAccess(patientId, 'Nhắc thuốc bằng giọng nói');
      if (!hasVoiceFeature) {
        return res.status(403).json({ success: false, message: 'Người bệnh chưa có gói dịch vụ "Nhắc thuốc bằng giọng nói". Không thể xóa.' });
      }
    }
    const reminder = await Reminder.findOne({
      _id: reminderId,
      userId: patientId
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch uống thuốc'
      });
    }

    // Soft delete - set isActive to false
    reminder.isActive = false;
    await reminder.save();

    res.json({
      success: true,
      message: 'Xóa lịch uống thuốc thành công'
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// API xóa lịch tái khám của bệnh nhân (bởi người thân)
exports.deletePatientAppointment = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    // Kiểm tra quyền schedule_appointment
    if (!relationship.permissions.includes('schedule_appointment')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa lịch tái khám'
      });
    }

    const appointment = await Appointment.findOneAndDelete({
      _id: appointmentId,
      userId: patientId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch tái khám'
      });
    }

    res.json({
      success: true,
      message: 'Xóa lịch tái khám thành công'
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// API debug - Kiểm tra quyền của người thân đối với bệnh nhân
exports.checkRelativePermissions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    const relationship = await RelativePatient.findOne({
      patient: patientId,
      relative: relativeId,
      status: 'accepted'
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mối quan hệ'
      });
    }

    res.json({
      success: true,
      data: {
        relationshipId: relationship._id,
        patientId: relationship.patient,
        relativeId: relationship.relative,
        status: relationship.status,
        permissions: relationship.permissions || [],
        hasScheduleMedicationPermission: (relationship.permissions || []).includes('schedule_medication'),
        hasScheduleAppointmentPermission: (relationship.permissions || []).includes('schedule_appointment'),
        createdAt: relationship.createdAt,
        updatedAt: relationship.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API cập nhật permissions cho mối quan hệ (chỉ patient mới có thể cập nhật)
exports.updateRelativePermissions = async (req, res) => {
  try {
    const { linkId } = req.params;
    const { permissions } = req.body;
    const userId = req.user._id;

    const relationship = await RelativePatient.findById(linkId);
    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mối quan hệ'
      });
    }

    // Chỉ patient mới có thể cập nhật quyền
    if (!relationship.patient.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người bệnh mới có thể cập nhật quyền'
      });
    }

    // Validate permissions
    const validPermissions = ['view_medical_records', 'schedule_medication', 'schedule_appointment', 'manage_health_data'];
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Quyền không hợp lệ: ${invalidPermissions.join(', ')}`
      });
    }

    relationship.permissions = permissions;
    await relationship.save();

    res.json({
      success: true,
      message: 'Cập nhật quyền thành công',
      data: {
        relationshipId: relationship._id,
        permissions: relationship.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API fix permissions cho các mối quan hệ đã tồn tại (dành cho debug)
exports.fixExistingPermissions = async (req, res) => {
  try {
    // Tìm tất cả mối quan hệ đã accepted nhưng chưa có permissions
    const relationships = await RelativePatient.find({
      status: 'accepted',
      $or: [
        { permissions: { $exists: false } },
        { permissions: { $size: 0 } },
        { permissions: null }
      ]
    });

    const defaultPermissions = ['view_medical_records', 'schedule_medication', 'schedule_appointment'];
    
    for (let relationship of relationships) {
      relationship.permissions = defaultPermissions;
      await relationship.save();
    }

    res.json({
      success: true,
      message: `Đã cập nhật permissions cho ${relationships.length} mối quan hệ`,
      data: {
        updatedCount: relationships.length,
        defaultPermissions,
        relationships: relationships.map(r => ({
          _id: r._id,
          patient: r.patient,
          relative: r.relative,
          permissions: r.permissions
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API test authentication và user info
exports.testAuth = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        userId: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        isBlocked: req.user.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API nhanh để fix permissions cho một mối quan hệ cụ thể
exports.quickFixPermissions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    const relationship = await RelativePatient.findOne({
      patient: patientId,
      relative: relativeId,
      status: 'accepted'
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mối quan hệ'
      });
    }

    // Cập nhật permissions mặc định
    const defaultPermissions = ['view_medical_records', 'schedule_medication', 'schedule_appointment'];
    relationship.permissions = defaultPermissions;
    await relationship.save();

    res.json({
      success: true,
      message: 'Đã cập nhật permissions thành công',
      data: {
        relationshipId: relationship._id,
        patientId: relationship.patient,
        relativeId: relationship.relative,
        oldPermissions: [],
        newPermissions: relationship.permissions,
        status: relationship.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== API QUẢN LÝ THUỐC CHO BỆNH NHÂN BỞI NGƯỜI THÂN ==========

// Lấy danh sách thuốc của bệnh nhân (cho người thân xem)
exports.getPatientMedications = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    const medications = await Medication.find({ userId: patientId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: medications
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy lịch sử huyết áp của bệnh nhân cho người thân
exports.getPatientBloodPressures = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    await checkRelativePermission(patientId, relativeId, req.user.role);

    const list = await BloodPressure.find({ userId: patientId }).sort({ measuredAt: -1 });
    res.json({ success: true, data: list });
  } catch (error) {
    if (error.message && error.message.includes('quyền')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy lần đo huyết áp mới nhất của bệnh nhân cho người thân
exports.getPatientLatestBloodPressure = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    await checkRelativePermission(patientId, relativeId, req.user.role);

    const latest = await BloodPressure.findOne({ userId: patientId }).sort({ measuredAt: -1 });
    if (!latest) return res.status(404).json({ success: false, message: 'Không có dữ liệu' });
    res.json({ success: true, data: latest });
  } catch (error) {
    if (error.message && error.message.includes('quyền')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Wrapper: Lấy tổng quan tuần uống thuốc (cho người thân)
exports.getPatientWeeklyOverview = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    await checkRelativePermission(patientId, relativeId, req.user.role);

    // Delegate tới medicationHistory controller, reusing logic
    // Build a fake req/res to pass userId param through
    const fakeReq = { params: { userId: patientId }, query: req.query };
    return medicationHistoryController.getWeeklyOverview(fakeReq, res);
  } catch (error) {
    if (error.message && error.message.includes('quyền')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Wrapper: Lấy tổng quan đầy đủ lịch sử uống thuốc (cho người thân)
exports.getPatientFullOverview = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    await checkRelativePermission(patientId, relativeId, req.user.role);

    const fakeReq = { params: { userId: patientId }, query: req.query };
    return medicationHistoryController.getFullOverview(fakeReq, res);
  } catch (error) {
    if (error.message && error.message.includes('quyền')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm thuốc mới cho bệnh nhân (bởi người thân)
exports.createMedicationForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { name, form, image, note, times, quantity } = req.body;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    // Nếu permissions trống => từ chối
    if (!relationship.permissions || relationship.permissions.length === 0) {
      return res.status(403).json({ success: false, message: 'Người thân chưa được cấp quyền. Vui lòng yêu cầu bệnh nhân cấp quyền.' });
    }

    // Kiểm tra quyền manage_health_data hoặc schedule_medication
    if (!relationship.permissions.includes('manage_health_data') && 
        !relationship.permissions.includes('schedule_medication')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền quản lý thuốc cho bệnh nhân'
      });
    }

    // Tạo medication mới
    const medication = new Medication({
      userId: patientId,
      name,
      form,
      image,
      note: note || `Thuốc được thêm bởi người thân: ${req.user.fullName}`,
      times,
      quantity,
      createdBy: req.user._id,
      createdByType: 'relative'
    });

    await medication.save();

    res.json({
      success: true,
      message: 'Thêm thuốc thành công',
      data: medication
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật thuốc của bệnh nhân (bởi người thân)
exports.updatePatientMedication = async (req, res) => {
  try {
    const { patientId, medicationId } = req.params;
    const updateData = req.body;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    // Nếu permissions trống => từ chối
    if (!relationship.permissions || relationship.permissions.length === 0) {
      return res.status(403).json({ success: false, message: 'Người thân chưa được cấp quyền. Vui lòng yêu cầu bệnh nhân cấp quyền.' });
    }

    // Kiểm tra quyền manage_health_data hoặc schedule_medication
    if (!relationship.permissions.includes('manage_health_data') && 
        !relationship.permissions.includes('schedule_medication')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật thuốc cho bệnh nhân'
      });
    }

    const medication = await Medication.findOne({
      _id: medicationId,
      userId: patientId
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thuốc'
      });
    }

    // Cập nhật medication
    Object.assign(medication, updateData);
    await medication.save();

    res.json({
      success: true,
      message: 'Cập nhật thuốc thành công',
      data: medication
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa thuốc của bệnh nhân (bởi người thân)
exports.deletePatientMedication = async (req, res) => {
  try {
    const { patientId, medicationId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    // Nếu permissions trống => từ chối
    if (!relationship.permissions || relationship.permissions.length === 0) {
      return res.status(403).json({ success: false, message: 'Người thân chưa được cấp quyền. Vui lòng yêu cầu bệnh nhân cấp quyền.' });
    }

    // Kiểm tra quyền manage_health_data hoặc schedule_medication
    if (!relationship.permissions.includes('manage_health_data') && 
        !relationship.permissions.includes('schedule_medication')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa thuốc cho bệnh nhân'
      });
    }

    const medication = await Medication.findOneAndDelete({
      _id: medicationId,
      userId: patientId
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thuốc'
      });
    }

    res.json({
      success: true,
      message: 'Xóa thuốc thành công'
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết thuốc của bệnh nhân (cho người thân xem)
exports.getPatientMedicationById = async (req, res) => {
  try {
    const { patientId, medicationId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    await checkRelativePermission(patientId, relativeId, req.user.role);

    const medication = await Medication.findOne({
      _id: medicationId,
      userId: patientId
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thuốc'
      });
    }

    res.json({
      success: true,
      data: medication
    });
  } catch (error) {
    if (error.message.includes('quyền')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lưu nhiều thuốc từ kết quả OCR cho bệnh nhân bởi người thân (nếu có quyền)
exports.createMedicationsFromOcrForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    // Kiểm tra quan hệ và quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    // Nếu permissions trống => từ chối
    if (!relationship.permissions || relationship.permissions.length === 0) {
      return res.status(403).json({ success: false, message: 'Người thân chưa được cấp quyền. Vui lòng yêu cầu bệnh nhân cấp quyền.' });
    }

    if (!relationship.permissions.includes('manage_health_data') && !relationship.permissions.includes('schedule_medication')) {
      return res.status(403).json({ success: false, message: 'Ba1n kh f4ng c f3 quy ean th eam thu f3c cho bc7nh nh e2n' });
    }

    const { medicines, imageUrl, rawText } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: 'Danh s e1ch thu f3c kh f4ng h f9p l ed' });
    }

    // Map từng thuốc sang schema Medication
    const docs = medicines.map(med => ({
      userId: patientId,
      name: med.name,
      form: med.form || '',
      image: med.image || imageUrl || '',
      note: med.usage || med.note || rawText || '',
      quantity: med.quantity || '',
      times: med.times || [],
      createdBy: relativeId,
      createdByType: 'relative'
    }));

    // Debug logging to help diagnose why inserts might not persist
    console.log('createMedicationsFromOcrForPatient: inserting docs count=', docs.length);
    if (docs.length > 0) console.log('example doc:', JSON.stringify(docs[0]).slice(0, 1000));

    try {
      const result = await Medication.insertMany(docs, { ordered: false });
      console.log('createMedicationsFromOcrForPatient: insertMany result count=', Array.isArray(result) ? result.length : 0);
      return res.status(201).json({ success: true, data: result });
    } catch (insertErr) {
      console.error('createMedicationsFromOcrForPatient: insertMany error:', insertErr && (insertErr.stack || insertErr.message || insertErr));
      // If validation errors, return details to client for debugging
      if (insertErr && insertErr.writeErrors) {
        const messages = insertErr.writeErrors.map(e => e.err && e.err.message ? e.err.message : (e.toString()));
        return res.status(400).json({ message: 'Lỗi khi lưu một số thuốc', details: messages, error: insertErr.message });
      }
      return res.status(500).json({ message: 'Lỗi khi lưu thuốc', error: insertErr.message || insertErr });
    }
  } catch (err) {
    console.error('Error in createMedicationsFromOcrForPatient:', err);
    res.status(400).json({ message: 'Không thể lưu danh sách thuốc', error: err.message });
  }
};

// Upload image, use central /ocr handler to parse, then save medications for patient (by relative)
exports.createMedicationsFromOcrImageForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const relativeId = req.user._id;

    // Only require that the patient has the OCR feature enabled
    try {
      const hasOcrFeature = await hasFeatureAccess(patientId, 'Phân tích đơn thuốc');
      if (!hasOcrFeature) {
        return res.status(403).json({ success: false, message: 'Người bệnh chưa có feature Phân tích đơn thuốc. Vui lòng mua gói.' });
      }
    } catch (fErr) {
      console.error('Error checking OCR feature access for patient:', fErr);
      return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền tính năng của người bệnh' });
    }

    if (!req.file) return res.status(400).json({ message: 'Thiếu file ảnh (field: image)' });

    // Delegate OCR + parsing to the central OCR controller to avoid duplicating logic
    const ocrController = require('./ocr.controller');

    // Create a fake response to capture what ocrController.ocrPrescription would send
    const captured = await new Promise((resolve) => {
      const fakeRes = {
        statusCode: 200,
        headers: {},
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          resolve({ status: this.statusCode || 200, body: payload });
          return this;
        },
        send(payload) {
          resolve({ status: this.statusCode || 200, body: payload });
          return this;
        },
        end() {
          resolve({ status: this.statusCode || 200, body: null });
        }
      };

      // Call the central OCR handler with the same req (it expects req.file) and our fakeRes
      try {
        ocrController.ocrPrescription(req, fakeRes);
      } catch (callErr) {
        console.error('Error calling central OCR handler:', callErr);
        resolve({ status: 500, body: { message: 'Lỗi khi gọi OCR trung tâm', error: callErr && callErr.message } });
      }
    });

    if (!captured || !captured.body) {
      return res.status(500).json({ message: 'OCR không trả về dữ liệu' });
    }

    // If central OCR returned an error status, forward it
    if (captured.status && captured.status >= 400) {
      return res.status(captured.status).json(captured.body);
    }

    const ocrResult = captured.body;
    const medicines = Array.isArray(ocrResult.medicines) ? ocrResult.medicines : [];
    const imageUrl = ocrResult.imageUrl || '';
    const rawText = ocrResult.rawText || '';

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ message: 'Không nhận diện được thuốc từ ảnh', rawText, imageUrl });
    }

    // Map and save medicines using existing Medication schema
    const docs = medicines.map(med => ({
      userId: patientId,
      name: med.name,
      form: med.form || '',
      image: med.image || imageUrl || '',
      note: med.usage || med.note || rawText || '',
      quantity: med.quantity || '',
      times: med.times || [],
      createdBy: relativeId,
      createdByType: 'relative'
    }));

    const result = await require('../models/Medication').insertMany(docs);
    res.status(201).json({ success: true, data: result, rawText, imageUrl });
  } catch (err) {
    console.error('Error in createMedicationsFromOcrImageForPatient:', err);
    res.status(500).json({ message: 'Lỗi OCR và lưu thuốc', error: err.message });
  }
};
