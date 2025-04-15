const express = require('express');
const router = express.Router();
const BudgetController = require('../controller/budgetController');
const verifyToken = require("../middleware/auth");

//http://localhost:3000/api/v1/budget/....
router.post('/create-budget',verifyToken(['User']), BudgetController.createBudget)//
router.get('/find-all',verifyToken(['Admin']), BudgetController.getAllBudget);//
router.get('/find-by/:id',verifyToken(['User','Admin']),BudgetController.getByBudgetId);//
router.put('/update-budget/:id',verifyToken(['User']),BudgetController.updateBudget);
router.delete('/delete-budget/:id',verifyToken(['User']),BudgetController.deleteBudget);
router.get('/budget-recommendation/:id',verifyToken(['User']),BudgetController.budgetRecommendations);//

module.exports = router;
