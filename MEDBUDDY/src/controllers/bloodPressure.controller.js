const BloodPressure = require('../models/BloodPressure');
const NotificationToken = require('../models/NotificationToken');
const NotificationHistory = require('../models/NotificationHistory');
const RelativePatient = require('../models/RelativePatient');
const User = require('../models/User');
const fcmService = require('../services/fcmService');

// Ghi nhận chỉ số huyết áp
exports.createBloodPressure = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { systolic, diastolic, pulse, measuredAt, note } = req.body;
    const bp = new BloodPressure({ userId, systolic, diastolic, pulse, measuredAt, note });
    await bp.save();

    // Fire-and-forget notification to relatives if BP high
    (async () => {
      try {
        // Simple thresholds to decide notification level
  const isUrgent = (systolic >= 180 || diastolic >= 110);
  const isHigh = (systolic >= 140 || diastolic >= 90);
  const isLow = (systolic < 90 || diastolic < 60);

        // Detect contradictory/mixed readings (e.g., systolic very low but diastolic very high)
        const isSystolicLow = (systolic < 90);
        const isDiastolicLow = (diastolic < 60);
        const isMixedOpposite = (isSystolicLow && (diastolic >= 90)) || (isDiastolicLow && (systolic >= 140));

        // If mixed contradictory reading, prefer asking patient to re-measure instead of alarming relatives.
        if (isMixedOpposite) {
          try {
            const title = 'Kết quả bất thường: Vui lòng đo lại';
            const body = `Kết quả ghi nhận: ${systolic}/${diastolic} mmHg có dấu hiệu mâu thuẫn. Vui lòng đo lại huyết áp để xác nhận.`;
            const patientTokens = await NotificationToken.find({ userId: userId });
            for (const t of patientTokens) {
              try {
                await fcmService.sendNotification(String(t.deviceToken), title, body, 'default');
                await NotificationHistory.create({ userId, title, body, deviceToken: t.deviceToken, sentAt: new Date() });
              } catch (err) {
                console.error('[BP Notify] Error sending inconsistent-reading notice to patient token', t.deviceToken, err && err.message ? err.message : err);
              }
            }
          } catch (err) {
            console.error('[BP Notify] Failed to notify patient about inconsistent reading:', err && err.message ? err.message : err);
          }
          return; // don't proceed to notify relatives as high/urgent
        }

  if (!isHigh && !isUrgent && !isLow) return; // no need to notify relatives for normal readings

        // Get patient info for message
        const patient = await User.findById(userId).select('fullName');
        const patientName = patient ? (patient.fullName || 'bệnh nhân') : 'bệnh nhân';

        let title;
        let body;
        if (isUrgent) {
          title = 'Cảnh báo khẩn cấp: Huyết áp rất cao';
          body = `🚨 ${patientName} vừa ghi nhận huyết áp rất cao: ${systolic}/${diastolic} mmHg. Vui lòng liên hệ ngay!`;
        } else if (isHigh) {
          title = 'Cảnh báo: Huyết áp cao';
          body = `${patientName} vừa ghi nhận huyết áp cao: ${systolic}/${diastolic} mmHg. Hãy theo dõi.`;
        } else {
          // low
          title = 'Cảnh báo: Hạ huyết áp';
          body = `${patientName} vừa ghi nhận huyết áp thấp: ${systolic}/${diastolic} mmHg. Vui lòng kiểm tra và hỗ trợ.`;
        }

        // Find accepted relatives with proper permissions
        const relationships = await RelativePatient.find({
          patient: userId,
          status: 'accepted',
          permissions: { $in: ['manage_health_data', 'schedule_medication'] }
        }).populate('relative');

        for (const rel of relationships) {
          const relativeUser = rel.relative;
          if (!relativeUser) continue;

          const tokens = await NotificationToken.find({ userId: relativeUser._id });
          for (const tokenDoc of tokens) {
            try {
              const resp = await fcmService.sendNotification(
                String(tokenDoc.deviceToken),
                title,
                body,
                'default'
              );

              // Create history entry (even if resp is null when token removed)
              await NotificationHistory.create({
                userId: relativeUser._id,
                title,
                body,
                deviceToken: tokenDoc.deviceToken,
                sentAt: new Date()
              });
            } catch (err) {
              console.error('[BP Notify] Error sending to relative token', tokenDoc.deviceToken, err && err.message ? err.message : err);
            }
          }
        }
      } catch (err) {
        console.error('[BP Notify] Failed to notify relatives:', err && err.message ? err.message : err);
      }
    })();

    res.status(201).json(bp);
  } catch (err) {
    res.status(400).json({ message: 'Không thể ghi nhận huyết áp', error: err.message });
  }
};

// Lấy lịch sử huyết áp
exports.getBloodPressures = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const list = await BloodPressure.find({ userId }).sort({ measuredAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy lần đo mới nhất
exports.getLatestBloodPressure = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const latest = await BloodPressure.findOne({ userId }).sort({ measuredAt: -1 });
    if (!latest) return res.status(404).json({ message: 'Không có dữ liệu' });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa lần đo
exports.deleteBloodPressure = async (req, res) => {
  try {
    const bp = await BloodPressure.findByIdAndDelete(req.params.id);
    if (!bp) return res.status(404).json({ message: 'Không tìm thấy lần đo' });
    res.json({ message: 'Đã xóa lần đo' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
