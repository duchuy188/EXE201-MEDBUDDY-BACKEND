const Appointment = require('../models/Appointment');
const { sendNotification } = require('../services/fcmService');

// Helper: tạo ghi chú mặc định cho lịch (nếu notes trống)
function generateAppointmentNote({ title, hospital, location }) {
    const place = hospital ? `${hospital}${location ? ' (' + location + ')' : ''}` : 'cơ sở y tế';
    const t = title && title.trim() ? title.trim() : 'Tái khám';
    return `Bạn có lịch ${t} tại ${place}. Vui lòng mang theo hồ sơ và giấy tờ tùy thân.`;
}

const createAppointment = async (req, res) => {
    try {
        const { title, hospital, location, date, time, notes } = req.body;
        const userId = req.user._id;

    // Nếu notes không có hoặc rỗng, tự động gán giá trị mặc định chi tiết
    const finalNotes = (!notes || notes.trim() === "") ? generateAppointmentNote({ title, hospital, location }) : notes;

        const appointment = new Appointment({
            title,
            hospital,
            location,
            date,
            time,
            notes: finalNotes,
            userId
        });

        await appointment.save();

        // Schedule notification for the appointment
        const NotificationToken = require('../models/NotificationToken');
        const tokenDoc = await NotificationToken.findOne({ userId });
        if (tokenDoc && tokenDoc.deviceToken) {
            const titleMsg = title && title.trim() ? title : 'Lịch hẹn tái khám mới';
            const bodyMsg = `Bạn có lịch hẹn tại ${hospital} vào ngày ${new Date(date).toLocaleDateString('vi-VN')} lúc ${time}`;
            await sendNotification(tokenDoc.deviceToken, titleMsg, bodyMsg);
        }

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

const getAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        const appointments = await Appointment.find({ userId })
            .sort({ date: 1, time: 1 });

        // Thay notes mặc định cũ bằng câu rõ ràng hơn trước khi trả về
        const normalized = appointments.map(a => {
            if (!a.notes || a.notes.trim() === '' || a.notes.trim() === 'Đã đến lịch tái khám') {
                a.notes = generateAppointmentNote({ title: a.title, hospital: a.hospital, location: a.location });
            }
            return a;
        });

        res.status(200).json({
            success: true,
            data: normalized
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy lịch hẹn'
            });
        }

        // Nếu notes rỗng hoặc là placeholder cũ thì thay bằng câu chi tiết
        if (!appointment.notes || appointment.notes.trim() === '' || appointment.notes.trim() === 'Đã đến lịch tái khám') {
            appointment.notes = generateAppointmentNote({ title: appointment.title, hospital: appointment.hospital, location: appointment.location });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy lịch hẹn'
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy lịch hẹn'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
};
