const Reminder = require('../models/Reminder');
const MedicationHistory = require('../models/MedicationHistory');
const { createSafeMedicationHistory } = require('../services/medicationHistorySafe.service');
const MedicationQuantityService = require('../services/medicationQuantity.service');

// Helper function để cộng phút vào thời gian HH:mm
function addMinutes(timeStr, minutes) {
  const [hours, mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
}

// API để xem trạng thái các lần uống của reminder hôm nay
exports.getReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Tìm reminder
    const reminder = await Reminder.findById(id).populate('medicationId');
    if (!reminder) {
      return res.status(404).json({ message: 'Không tìm thấy reminder' });
    }

    // Lấy tất cả lịch sử uống thuốc hôm nay cho reminder này
    const histories = await MedicationHistory.find({
      reminderId: id,
      date: today
    }).sort({ time: 1 });

    // Tạo thông tin chi tiết cho từng lần uống
    const statusDetails = reminder.repeatTimes.map(repeatTime => {
      const history = histories.find(h => h.time === repeatTime.time);
      
      return {
        time: repeatTime.time,
        status: history ? history.status : 'pending',
        taken: history ? history.taken : false,
        takenAt: history ? history.takenAt : null,
        snoozeUntil: history ? history.snoozeUntil : null,
        snoozeCount: history ? history.snoozeCount : 0,
        canTake: !history || ['pending', 'snoozed'].includes(history.status),
        canSkip: !history || ['pending', 'snoozed'].includes(history.status),
        canSnooze: !history || (['pending', 'snoozed'].includes(history.status) && (history.snoozeCount || 0) < 3)
      };
    });

    res.json({
      reminder: {
        id: reminder._id,
        medicationName: reminder.medicationId.name,
        note: reminder.note,
        isActive: reminder.isActive
      },
      date: today,
      totalTimes: reminder.repeatTimes.length,
      completed: statusDetails.filter(s => s.status === 'on_time' || s.status === 'late').length,
      missed: statusDetails.filter(s => s.status === 'missed').length,
      skipped: statusDetails.filter(s => s.status === 'skipped').length,
      pending: statusDetails.filter(s => s.status === 'pending').length,
      snoozed: statusDetails.filter(s => s.status === 'snoozed').length,
      statusDetails: statusDetails
    });

  } catch (err) {
    console.error('[API] Lỗi:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// API để user thực hiện action: take/skip/snooze
exports.updateReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;           // ID của reminder
    const { action, time } = req.body;   // action: take/skip/snooze, time: "08:00"

    // Validate input
    if (!['take', 'skip', 'snooze'].includes(action)) {
      return res.status(400).json({ message: 'Action phải là: take, skip, hoặc snooze' });
    }
    if (!time) {
      return res.status(400).json({ message: 'Thiếu thông tin time (HH:mm)' });
    }

    // Tìm reminder
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: 'Không tìm thấy nhắc nhở' });
    }

    // Kiểm tra time có tồn tại trong repeatTimes không
    const repeatTime = reminder.repeatTimes.find(rt => rt.time === time);
    if (!repeatTime) {
      return res.status(404).json({ message: 'Không tìm thấy thời gian này trong lịch nhắc' });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Tìm hoặc tạo MedicationHistory cho hôm nay
    let history = await MedicationHistory.findOne({
      reminderId: reminder._id,
      date: today,
      time: time
    });

    if (!history) {
      history = await createSafeMedicationHistory({
        userId: reminder.userId,
        medicationId: reminder.medicationId,
        reminderId: reminder._id,
        date: today,
        time: time,
        taken: false,
        status: 'pending'
      }) || null;
    }

    // Kiểm tra trạng thái hiện tại trước khi thực hiện action
    if (history.status === 'on_time' || history.status === 'late') {
      if (action === 'skip') {
        return res.status(400).json({ 
          message: 'Không thể bỏ qua lần uống đã được đánh dấu là đã uống',
          currentStatus: history.status 
        });
      }
      if (action === 'snooze') {
        return res.status(400).json({ 
          message: 'Không thể hoãn lần uống đã được đánh dấu là đã uống',
          currentStatus: history.status 
        });
      }
      if (action === 'take') {
        return res.status(400).json({ 
          message: 'Lần uống này đã được đánh dấu là đã uống rồi',
          currentStatus: history.status,
          takenAt: history.takenAt
        });
      }
    }

    if (history.status === 'skipped') {
      if (action === 'skip') {
        return res.status(400).json({ 
          message: 'Lần uống này đã được đánh dấu bỏ qua rồi',
          currentStatus: history.status 
        });
      }
    }

    // Thực hiện action
    if (action === 'take') {
      // Kiểm tra uống đúng giờ hay trễ
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      const scheduledTime = time;
      
      // So sánh thời gian hiện tại với giờ đã lên lịch
      const isOnTime = currentTime <= scheduledTime || 
                       (currentTime <= addMinutes(scheduledTime, 15)); // Cho phép trễ 15 phút vẫn tính on_time
      
      history.status = isOnTime ? 'on_time' : 'late';
      history.taken = true;
      history.takenAt = new Date();
      
      console.log(`[STATUS] Scheduled: ${scheduledTime}, Current: ${currentTime}, Status: ${history.status}`);
      
      // Cập nhật số lượng thuốc sau khi uống
      if (reminder.medicationId) {
        try {
          await MedicationQuantityService.updateQuantityAfterTaking(
            reminder.medicationId, 
            reminder.note || '1 viên'
          );
          console.log(`[QUANTITY] Đã cập nhật số lượng thuốc cho medicationId: ${reminder.medicationId}`);
        } catch (quantityError) {
          console.error('Lỗi cập nhật số lượng:', quantityError);
          // Không throw error để không ảnh hưởng đến việc cập nhật trạng thái
        }
      }
      
    } else if (action === 'skip') {
      history.status = 'skipped';
      history.taken = false;
      history.takenAt = null;
      
    } else if (action === 'snooze') {
      // Kiểm tra chỉ cho phép snooze trong cùng ngày
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      if (today !== todayStr) {
        return res.status(400).json({ 
          message: 'Chỉ có thể hoãn lần uống trong cùng ngày' 
        });
      }
      
      // Giới hạn số lần snooze (tối đa 3 lần)
      if (history.snoozeCount >= 3) {
        return res.status(400).json({ 
          message: 'Đã hết số lần hoãn (tối đa 3 lần)' 
        });
      }

      // Kiểm tra logic thời gian snooze
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      const scheduledTime = time;
      
      // Tính toán thời gian snooze dựa trên tình huống
      let snoozeTime = new Date();
      let snoozeMessage = '';
      
      if (currentTime < scheduledTime) {
        // TRƯỜNG HỢP 1: Snooze TRƯỚC giờ uống (VD: 7:55 snooze cho 8:00)
        // → Hoãn đến 5 phút sau giờ uống ban đầu
        const [hours, mins] = scheduledTime.split(':').map(Number);
        snoozeTime.setHours(hours, mins + 5, 0, 0);
        snoozeMessage = `trước giờ → hoãn đến ${snoozeTime.getHours().toString().padStart(2, '0')}:${snoozeTime.getMinutes().toString().padStart(2, '0')}`;
        
      } else {
        // TRƯỜNG HỢP 2: Snooze SAU giờ uống (VD: 10:00 snooze cho 8:00)
        // → Hoãn 5 phút từ thời điểm hiện tại
        snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);
        snoozeMessage = `sau giờ → hoãn thêm 5 phút từ bây giờ`;
      }

      // Kiểm tra snooze time không vượt quá 23:59 cùng ngày
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      if (snoozeTime > endOfDay) {
        return res.status(400).json({ 
          message: 'Không thể hoãn qua ngày hôm sau. Vui lòng chọn uống hoặc bỏ qua.' 
        });
      }
      
      history.status = 'snoozed';
      history.snoozeUntil = snoozeTime;
      history.snoozeCount = (history.snoozeCount || 0) + 1;
      
      console.log(`[SNOOZE] Scheduled: ${scheduledTime}, Current: ${currentTime}, Logic: ${snoozeMessage}`);
      console.log(`[SNOOZE] Will remind again at: ${snoozeTime.toLocaleString('vi-VN')}`);
    }

    await history.save();

    // Tạo response message với thông tin chi tiết
    let message = `Đã ${action === 'take' ? 'đánh dấu uống' : action === 'skip' ? 'bỏ qua' : 'hoãn'} lần uống ${time}`;
    if (action === 'snooze') {
      message += ` - Sẽ nhắc lại vào lúc ${history.snoozeUntil.toLocaleTimeString('vi-VN')} (${history.snoozeCount}/3 lần hoãn)`;
    }

    res.json({
      message: message,
      history: {
        date: history.date,
        time: history.time,
        status: history.status,
        taken: history.taken,
        takenAt: history.takenAt,
        snoozeUntil: history.snoozeUntil,
        snoozeCount: history.snoozeCount
      }
    });

  } catch (err) {
    console.error('[API] Lỗi:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};