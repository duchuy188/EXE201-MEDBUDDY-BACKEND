const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { requireFeature } = require('../middlewares/packageAccess.middleware');
const appointmentAccessMiddleware = requireFeature('Đặt lịch khám');
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointment.controller');

router.use(auth);

router.route('/')
    .post(appointmentAccessMiddleware, createAppointment)
    .get(getAppointments);

router.route('/:id')
    .get(getAppointmentById)
    .put(appointmentAccessMiddleware, updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
