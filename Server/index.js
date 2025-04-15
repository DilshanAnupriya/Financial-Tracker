const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {mongo} = require("mongoose");
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const URL = process.env.URL;

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//================
const TransactionRoute = require('./route/TransactionRoute');
const UserRoute = require('./route/userRoute');
const BudgetRoute = require('./route/budgetRoute');
const ReportsRoute = require('./route/financialReportRoute');
const GoalRoute = require('./route/goalsAndSavingRoute');
const NotificationRoute = require('./route/notificationRoute');
const DashboardRoute = require('./route/dashboardRoute');

//============
app.use('/api/v1/transaction',TransactionRoute)
app.use('/api/v1/user', UserRoute);
app.use('/api/v1/budget', BudgetRoute);
app.use('/api/v1/reports', ReportsRoute);
app.use('/api/v1/goals&savings', GoalRoute);
app.use('/api/v1/notification', NotificationRoute);
app.use('/api/v1/dashboard', DashboardRoute);




mongoose.connect(URL).then(()=>{
    console.log('MongoDB Connected!...');
}).catch(err=>{
    console.error((err));
});


app.listen(PORT,() => {
    console.log(`Server started on port: ${PORT}`);
});

module.exports = app;