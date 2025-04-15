const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/dashboardController');
const verifyToken = require("../middleware/auth");

//http://localhost:3000/api/v1/dashboard/admin....

router.get('/admin',verifyToken(['Admin']),DashboardController.AdminDashboard);//
router.get('/user',verifyToken(['User']),DashboardController.UserDashboard);//


module.exports = router;
