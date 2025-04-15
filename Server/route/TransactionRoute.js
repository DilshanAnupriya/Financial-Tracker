const express = require('express');
const router = express.Router();
const TransactionController = require('../controller/transactionController');
const verifyToken = require('../middleware/auth');

//http://localhost:3000/api/v1/transaction/create-transaction....
router.post('/create-transaction',verifyToken(['User']), TransactionController.createTransaction);//
router.get('/find-all',verifyToken(['Admin']), TransactionController.getAllTransaction);
router.get('/find-by/:id',verifyToken(['User','Admin']),TransactionController.getByTransactionId);
router.put('/update/:id',verifyToken(['User']),TransactionController.updateTransaction);
router.delete('/delete/:id',verifyToken(['User']),TransactionController.deleteTransaction);


module.exports = router;
