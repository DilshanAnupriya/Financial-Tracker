const express = require('express');
const router = express.Router();
const GoalController = require('../controller/goalsAndSavingsController');
const verifyToken = require("../middleware/auth");

//http://localhost:3000/api/v1/goals&savings/....
router.post('/create-goal',verifyToken(['User']), GoalController.createGoal);//
router.get('/find-all',verifyToken(['User','Admin']), GoalController.getAllGoals);//
router.get('/find-by/:id',verifyToken(['User']),GoalController.getByGoalId);//
router.put('/update-goal/:id',verifyToken(['User']),GoalController.updateGoal);
router.delete('/delete-goal/:id',verifyToken(['User']),GoalController.deleteGoal);
router.put('/update-progress/:id',verifyToken(['User']),GoalController.updateProgress);//
router.get('/progress/:id',verifyToken(['User']),GoalController.isComplete);//


module.exports = router;
