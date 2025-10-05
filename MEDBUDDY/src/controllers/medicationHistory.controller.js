const MedicationHistory = require('../models/MedicationHistory');

// Tạo lịch sử uống thuốc mới
exports.createHistory = async (req, res) => {
  try {
    const { userId, medicationId, reminderId, date, time, taken, takenAt, status } = req.body;
    const history = new MedicationHistory({
      userId,
      medicationId,
      reminderId,
      date,
      time,
      taken: taken || false,
      takenAt,
      status: status || 'missed',
    });
    await history.save();
    res.status(201).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy lịch sử uống thuốc theo user
exports.getHistoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const histories = await MedicationHistory.find({ userId });
    res.json(histories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tổng quan tuần uống thuốc (như trong app)
exports.getWeeklyOverview = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    console.log(`[WEEKLY] Input - userId: ${userId}, startDate: ${startDate}, endDate: ${endDate}`);

    // Nếu không có startDate/endDate, lấy tuần hiện tại
    let start, end;
    if (startDate && endDate) {
      start = startDate;
      end = endDate;
    } else {
      // Tính tuần hiện tại (T2 -> CN)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=CN, 1=T2, ..., 6=T7
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      start = monday.toISOString().split('T')[0];
      end = sunday.toISOString().split('T')[0];
    }

    console.log(`[WEEKLY] Date range: ${start} to ${end}`);

    // Lấy tất cả histories trong khoảng thời gian
    const histories = await MedicationHistory.find({
      userId,
      date: { $gte: start, $lte: end }
    });

    console.log(`[WEEKLY] Found ${histories.length} raw histories`);
    console.log(`[WEEKLY] Sample history:`, histories[0]);

    // Populate sau khi đã có data
    const populatedHistories = await MedicationHistory.find({
      userId,
      date: { $gte: start, $lte: end }
    }).populate('medicationId', 'name dosage').populate('reminderId', 'note');

    console.log(`[WEEKLY] Found ${populatedHistories.length} populated histories`);
    console.log(`[WEEKLY] Sample populated:`, populatedHistories[0]);

    // Group theo medication để hiển thị như trong app
    const medicationGroups = {};
    
    populatedHistories.forEach(history => {
      console.log(`[WEEKLY] Processing history:`, {
        medicationId: history.medicationId,
        reminderId: history.reminderId,
        date: history.date,
        status: history.status
      });

      if (!history.medicationId) {
        console.log(`[WEEKLY] Skipping history without medicationId:`, history._id);
        return;
      }

      const medId = history.medicationId._id.toString();
      if (!medicationGroups[medId]) {
        medicationGroups[medId] = {
          medicationId: medId,
          medicationName: history.medicationId.name || 'Unknown Medication',
          dosage: history.medicationId.dosage || '',
          note: history.reminderId?.note || '',
          weeklyStats: {
            totalDoses: 0,
            takenOnTime: 0,
            takenLate: 0,
            missed: 0,
            skipped: 0,
            adherenceRate: 0
          },
          dailyBreakdown: {
            'T2': { taken: 0, missed: 0 },
            'T3': { taken: 0, missed: 0 },
            'T4': { taken: 0, missed: 0 },
            'T5': { taken: 0, missed: 0 },
            'T6': { taken: 0, missed: 0 },
            'T7': { taken: 0, missed: 0 },
            'CN': { taken: 0, missed: 0 }
          }
        };
      }

      const group = medicationGroups[medId];
      group.weeklyStats.totalDoses++;

      // Đếm theo status
      switch (history.status) {
        case 'on_time':
          group.weeklyStats.takenOnTime++;
          break;
        case 'late':
          group.weeklyStats.takenLate++;
          break;
        case 'missed':
          group.weeklyStats.missed++;
          break;
        case 'skipped':
          group.weeklyStats.skipped++;
          break;
      }

      // Đếm theo ngày trong tuần
      const historyDate = new Date(history.date + 'T00:00:00Z');
      const dayOfWeek = historyDate.getDay();
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayKey = dayNames[dayOfWeek];

      if (history.status === 'on_time' || history.status === 'late') {
        group.dailyBreakdown[dayKey].taken++;
      } else if (history.status === 'missed' || history.status === 'skipped') {
        group.dailyBreakdown[dayKey].missed++;
      }
    });

    console.log(`[WEEKLY] Medication groups:`, Object.keys(medicationGroups));

    // Tính adherence rate cho từng medication
    Object.values(medicationGroups).forEach(group => {
      const taken = group.weeklyStats.takenOnTime + group.weeklyStats.takenLate;
      group.weeklyStats.adherenceRate = group.weeklyStats.totalDoses > 0 
        ? Math.round((taken / group.weeklyStats.totalDoses) * 100) 
        : 0;
    });

    const result = {
      period: {
        startDate: start,
        endDate: end,
        totalDays: 7
      },
      medications: Object.values(medicationGroups),
      summary: {
        totalMedications: Object.keys(medicationGroups).length,
        averageAdherence: Object.values(medicationGroups).reduce((sum, med) => sum + med.weeklyStats.adherenceRate, 0) / Object.keys(medicationGroups).length || 0
      }
    };

    console.log(`[WEEKLY] Final result:`, JSON.stringify(result, null, 2));
    res.json(result);

  } catch (err) {
    console.error('[API] Lỗi weekly overview:', err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả lịch sử với overview đơn giản (không theo tuần)
exports.getFullOverview = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    // Lấy tất cả histories với populate
    const histories = await MedicationHistory.find({ userId })
      .populate('medicationId', 'name dosage')
      .populate('reminderId', 'note')
      .sort({ date: -1, time: -1 }) // Mới nhất trước
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Đếm tổng
    const total = await MedicationHistory.countDocuments({ userId });

    // Thống kê tổng quan
    const allHistories = await MedicationHistory.find({ userId });
    const stats = {
      total: allHistories.length,
      pending: allHistories.filter(h => h.status === 'pending').length,
      on_time: allHistories.filter(h => h.status === 'on_time').length,
      late: allHistories.filter(h => h.status === 'late').length,
      missed: allHistories.filter(h => h.status === 'missed').length,
      skipped: allHistories.filter(h => h.status === 'skipped').length,
      snoozed: allHistories.filter(h => h.status === 'snoozed').length
    };

    // Tính tỷ lệ tuân thủ
    const completedCount = stats.on_time + stats.late;
    const adherenceRate = stats.total > 0 ? Math.round((completedCount / stats.total) * 100) : 0;

    // Group theo medication
    const medicationGroups = {};
    histories.forEach(history => {
      const medId = history.medicationId._id.toString();
      if (!medicationGroups[medId]) {
        medicationGroups[medId] = {
          medicationId: medId,
          medicationName: history.medicationId.name,
          dosage: history.medicationId.dosage || '',
          note: history.reminderId?.note || '',
          histories: []
        };
      }
      medicationGroups[medId].histories.push({
        id: history._id,
        date: history.date,
        time: history.time,
        status: history.status,
        taken: history.taken,
        takenAt: history.takenAt,
        snoozeUntil: history.snoozeUntil,
        snoozeCount: history.snoozeCount
      });
    });

    res.json({
      data: histories,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      },
      stats,
      adherenceRate,
      medicationGroups: Object.values(medicationGroups)
    });

  } catch (err) {
    console.error('[API] Lỗi full overview:', err);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật trạng thái uống thuốc
exports.updateHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { taken, takenAt, status } = req.body;
    const history = await MedicationHistory.findByIdAndUpdate(
      id,
      { taken, takenAt, status },
      { new: true }
    );
    if (!history) return res.status(404).json({ error: 'Not found' });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa lịch sử uống thuốc
exports.deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MedicationHistory.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
