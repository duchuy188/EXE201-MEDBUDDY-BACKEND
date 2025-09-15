const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointment.controller');

router.use(auth);

router.route('/')
    .post(createAppointment)
    .get(getAppointments);

router.route('/:id')
    .get(getAppointmentById)
    .put(updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
