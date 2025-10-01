var express = require('express');
var router = express.Router();

const usersRouter = require('./users');
const medicationsRouter = require('./medications');
const remindersRouter = require('./reminders');
const bloodPressureRouter = require('./bloodPressure');
const notificationsRouter = require('./notifications');
const alertsRouter = require('./alerts');

const medicationHistoryRouter = require('./medicationsHistory');
const ocrRouter = require('./ocr');
const relativePatientRouter = require('./relativePatient');
const packageRouter = require('./package');
const vnpayRouter = require('./vnpay');
const bloodPressureReminderRouter = require('./bloodPressureReminder');
const payosRouter = require('./payos');
const userPackageRouter = require('./userPackage');
const adminRouter = require('./admin');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Welcome to MEDBUDDY API!');
});

// User routes
router.use('/users', usersRouter);

// Medication routes
router.use('/medications', medicationsRouter);

// Reminder routes
router.use('/reminders', remindersRouter);

// Blood Pressure routes
router.use('/blood-pressure', bloodPressureRouter);

// Notification routes
router.use('/notifications', notificationsRouter);

// Alert routes
router.use('/alerts', alertsRouter);

// Medication history routes
router.use('/medication-history', medicationHistoryRouter);

// Relative-Patient routes
router.use('/relative-patient', relativePatientRouter);

// OCR routes
router.use('/ocr', ocrRouter);

// Package routes
router.use('/package', packageRouter);

// VNPay routes
router.use('/vnpay', vnpayRouter);

// Blood Pressure Reminder routes
router.use('/blood-pressure-reminder', bloodPressureReminderRouter);
// PayOS routes
router.use('/payos', payosRouter);

// User Package routes
router.use('/user-package', userPackageRouter);

// Admin routes
router.use('/admin', adminRouter);

module.exports = router;
