const express = require('express');
const router = express.Router();
const ReportController = require('../controller/financialReportController');
const verifyToken = require("../middleware/auth");

//http://localhost:3000/api/v1/reports/get-all....
router.get('/get-report-by/',verifyToken(['User','Admin']), ReportController.generateSpendingTrendReportById);
router.get('/get-all-report',verifyToken(['Admin']), ReportController.generateSpendingTrendReport);
router.get('/incomeVsExpenseBy',verifyToken(['User','Admin']), ReportController.IncomeVsExpensesById);
router.get('/total-incomeVsExpense',verifyToken(['Admin']), ReportController.IncomeVsExpenses);

module.exports = router;
