const User = require("../model/userModel");
const Transaction = require("../model/transactionModel");
const  Budget = require('../model/budgetModel');
const Goal = require('../model/goalsAndSavingsModel');


const AdminDashboard = async (req, res) => {
    try{
        const user = await User.find();
        const transactions = await Transaction.find();
        const totalTransaction = transactions.reduce((sum,t)=> sum + t.amount, 0);
        const totalGoals = await Goal.countDocuments();
        const budget = await Budget.find();

        res.status(200).json({
            message:"Admin Dashboard details ",
            totalTransaction:totalTransaction,
            totalGoals:totalGoals,
            users:user,
            transactions:transactions,
            budget:budget
        });
    }catch (e){
        res.status(500).json({error: e});
    }
}

const UserDashboard = async (req, res) => {
    try {




        const userId = req.user._id;

        if (!userId || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized: No user found in token" });
        }

        const transactions = await Transaction.find({ userId });
        const goals = await Goal.find({ userId });
        const budgets = await Budget.find({ userId });

        const totalSpent = transactions.reduce((sum, t) => t.type === 'Expense' ? sum + t.amount : sum, 0);
        const totalIncome = transactions.reduce((sum, t) => t.type === 'Income' ? sum + t.amount : sum, 0);

        res.status(200).json({
            message: "User Dashboard details",
            totalSpent,
            totalIncome,
            transactions,
            goals,
            budgets,

        });
    } catch (e) {
        console.error("User Dashboard Error:", e);
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    AdminDashboard,UserDashboard
}