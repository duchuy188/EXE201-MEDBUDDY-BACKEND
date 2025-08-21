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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Welcome to MEDBUDDY API!');
});

// User routes

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

// OCR routes
router.use('/ocr', ocrRouter);

module.exports = router;
