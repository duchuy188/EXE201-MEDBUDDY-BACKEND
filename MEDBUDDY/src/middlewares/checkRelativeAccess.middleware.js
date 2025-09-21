const RelativePatient = require('../models/RelativePatient');
const User = require('../models/User');

// Middleware kiểm tra quyền truy cập dữ liệu người bệnh
// Chỉ cho phép người thân truy cập nếu có liên kết với người bệnh
module.exports = async function checkRelativeAccess(req, res, next) {
  try {
    const relativeId = req.user._id;
    const patientId = req.params.patientId || req.body.patientId;
    if (!patientId) {
      return res.status(400).json({ message: 'Thiếu patientId.' });
    }
    // Kiểm tra liên kết
    const link = await RelativePatient.findOne({ patient: patientId, relative: relativeId, status: 'accepted' });
    if (!link) {
      return res.status(403).json({ message: 'Không có quyền truy cập dữ liệu người bệnh này.' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
