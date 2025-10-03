const RelativePatient = require('../models/RelativePatient');
const User = require('../models/User');
const { sendInviteEmail } = require('../services/inviteEmailService');
const Package = require('../models/Package');
const Reminder = require('../models/Reminder');
const Appointment = require('../models/Appointment');
const Medication = require('../models/Medication');

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
    throw new Error('Chỉ người thân mới có quyền thực hiện hành động này');
  }

  const relationship = await RelativePatient.findOne({
    patient: patientId,
    relative: relativeId,
    status: 'accepted'
  });

  if (!relationship) {
    throw new Error('Bạn không có quyền thực hiện hành động này cho bệnh nhân');
  }

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

    // AUTO-FIX: Nếu permissions trống, tự động cập nhật
    if (!relationship.permissions || relationship.permissions.length === 0) {
      console.log('🔧 Auto-fixing empty permissions...');
      relationship.permissions = ['view_medical_records', 'schedule_medication', 'schedule_appointment'];
      await relationship.save();
      console.log('✅ Permissions auto-fixed:', relationship.permissions);
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

    // Tạo reminder mới
    const reminder = new Reminder({
      userId: patientId,
      medicationId,
      reminderType: reminderType || 'normal',
      times,
      startDate,
      endDate,
      repeatTimes,
      note: note || `Lịch uống thuốc được tạo bởi người thân: ${req.user.fullName}`,
      voice: voice || 'banmai',
      isActive: true,
      createdBy: req.user._id,
      createdByType: 'relative'
    });

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

    // Cập nhật reminder
    Object.assign(reminder, updateData);
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

// Thêm thuốc mới cho bệnh nhân (bởi người thân)
exports.createMedicationForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { name, form, image, note, times, quantity } = req.body;
    const relativeId = req.user._id;

    // Kiểm tra quyền
    const relationship = await checkRelativePermission(patientId, relativeId, req.user.role);

    // AUTO-FIX: Nếu permissions trống, tự động cập nhật
    if (!relationship.permissions || relationship.permissions.length === 0) {
      relationship.permissions = ['view_medical_records', 'schedule_medication', 'schedule_appointment'];
      await relationship.save();
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

    // AUTO-FIX permissions
    if (!relationship.permissions || relationship.permissions.length === 0) {
      relationship.permissions = ['view_medical_records', 'schedule_medication', 'schedule_appointment'];
      await relationship.save();
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

    // AUTO-FIX permissions
    if (!relationship.permissions || relationship.permissions.length === 0) {
      relationship.permissions = ['view_medical_records', 'schedule_medication', 'schedule_appointment'];
      await relationship.save();
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
