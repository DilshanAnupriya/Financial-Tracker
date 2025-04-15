const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');
const verifyToken = require('../middleware/auth');

//http://localhost:3000/api/v1/dashboard/signup
router.post('/login',UserController.logIn);//
router.post('/signup', UserController.signUp);//
router.get('/all-users',verifyToken(['Admin']), UserController.getAllUsers);//
router.get('/user-by',verifyToken(['User','Admin']),UserController.getByUserId);//
router.put('/update-user',verifyToken(['User']),UserController.updateUser);//
router.delete('/delete-user',verifyToken(['Admin']),UserController.deleteUser);//


module.exports = router;
