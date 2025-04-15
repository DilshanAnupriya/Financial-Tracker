const express = require('express');
const router = express.Router();
const NotificationController = require('../controller/notificationController');
const verifyToken = require("../middleware/auth");

//http://localhost:3000/api/v1/reports/get-all....
router.get('/deadline/:id', NotificationController.notifyDeadline);
router.get('/upcoming-transaction/:id', NotificationController.upcomingTransaction);
router.get('/upcoming-goals/:id', NotificationController.upcomingGoals);
router.get('/budget/:id', NotificationController.notifyBudget);

module.exports = router;
