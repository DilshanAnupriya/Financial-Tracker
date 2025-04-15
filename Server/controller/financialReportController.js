const Transactions = require('../model/transactionModel');
const Users = require('../model/userModel');
const mongoose = require('mongoose');

const generateSpendingTrendReportById = async (req, res) => {
    try {
        const { startDate, endDate, time_period ,category,tags } = req.query;

        let matchStage = { userId: new mongoose.Types.ObjectId(req.user._id) };

        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (category && typeof category === 'string') {
            matchStage.category = {$regex: category,$options: 'i'};
        }

        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
            matchStage.tags = { $in: tagsArray };
        }

        let dateGrouping;
            switch (time_period.toLowerCase()) {
                case 'daily':
                    dateGrouping = {
                        $dateToString: { format: "%d-%m-%Y", date: "$createdAt" }
                    };
                    break;
                case 'weekly':
                    dateGrouping = {
                        $concat: [
                            { $toString: { $week: "$createdAt" } },
                            "-",
                            { $toString: { $year: "$createdAt" } }
                        ]
                    };
                    break;
                case 'yearly':
                    dateGrouping = { $year: "$createdAt" };
                    break;
                case 'monthly':
                default:
                    dateGrouping = {$dateToString: { format: "%B-%Y", date: "$createdAt" }};
                    break;
            }


            const report = await Transactions.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: {
                            time_period:dateGrouping,
                            },

                        totalIncome: {
                            $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] }
                        },
                        totalExpenses: {
                            $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] }
                        },
                        netBalance: {
                            $sum: {
                                $cond: [
                                    {$eq: ["$type", "Income"]}, "$amount", {$multiply: ["$amount", -1]}
                                ]
                            }
                        },
                        transaction_Count: { $count:{}},
                        type: { $addToSet: "$type" },
                        category:{ $addToSet: "$category" },
                        recurrence:{ $addToSet: "$recurrence" },

                    }
                },
                { $sort: { "_id.year": 1,"_id.month": 1 } }

            ]);
            return res.status(200).json({ message: "Financial Report", report});
    } catch (err) {
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
};

const generateSpendingTrendReport = async (req, res) => {
    try {
        const { startDate, endDate, time_period='monthly' ,category,tags} = req.query;

        let matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (category && typeof category === 'string') {
            matchStage.category = {$regex: category,$options: 'i'};
        }

        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
            matchStage.tags = { $in: tagsArray };
        }

        let dateGrouping;
        switch (time_period.toLowerCase()) {
            case 'daily':
                dateGrouping = {
                    $dateToString: { format: "%d-%m-%Y", date: "$createdAt" }
                };
                break;
            case 'weekly':
                dateGrouping = {
                    $concat: [
                        { $toString: { $week: "$createdAt" } },
                        "-",
                        { $toString: { $year: "$createdAt" } }
                    ]
                };
                break;
            case 'yearly':
                dateGrouping = { $year: "$createdAt" };
                break;
            case 'monthly':
            default:
                dateGrouping = {$dateToString: { format: "%B-%Y", date: "$createdAt" }};
                break;
        }


        const report = await Transactions.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        time_period:dateGrouping,
                    },

                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] }
                    },
                    totalExpenses: {
                        $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] }
                    },
                    netBalance: {
                        $sum: {
                            $cond: [
                                {$eq: ["$type", "Income"]}, "$amount", {$multiply: ["$amount", -1]}
                            ]
                        }
                    },
                    transaction_Count: { $count:{}},
                    type: { $addToSet: "$type" },
                    category:{ $addToSet: "$category" },
                    recurrence:{ $addToSet: "$recurrence" },

                }
            },
            { $sort: { "_id.year": 1,"_id.month": 1 } }
        ]);
        return res.status(200).json({ message: "Financial Report", report});
    } catch (err) {
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
}

const IncomeVsExpensesById = async (req, res) => {
    const { startDate, endDate, time_period, category, tags, type } = req.query;

    let matchStage ={ userId: new mongoose.Types.ObjectId(req.user._id) };

    if (startDate && endDate) {
        matchStage.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }


    if (category && typeof category === 'string') {
        matchStage.category = { $regex: category, $options: 'i' };
    }


    if (type && typeof type === 'string') {
        matchStage.type = { $regex: type, $options: 'i' };
    }

    if (tags && typeof tags === 'string') {
        let tagsArray = tags.split(",").map(temp => temp.trim().toLowerCase());
        matchStage.tags = { $in: tagsArray };
    }

    let dateGrouping;
    switch (time_period?.toLowerCase()) {
        case 'daily':
            dateGrouping = { $dateToString: { format: '%d-%m-%Y', date: "$createdAt" } };
            break;
        case 'weekly':
            dateGrouping = {
                $concat: [
                    { $toString: { $week: "$createdAt" } }, "-",
                    { $toString: { $year: "$createdAt" } }
                ]
            };
            break;
        case 'yearly':
            dateGrouping = { $toString: { $year: "$createdAt" } };
            break;
        default:
            dateGrouping = { $dateToString: { format: "%B-%Y", date: "$createdAt" } };
            break;
    }

    try {

        const incomeVsExpenses = await Transactions.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { time_period: dateGrouping },
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] }
                    },
                    totalExpenses: {
                        $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] }
                    },
                    netBalance: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "Income"] }, "$amount", { $multiply: ["$amount", -1] }
                            ]
                        }
                    }
                }
            }
        ]);

        res.status(200).json({ message: "Income & Expanse", data:incomeVsExpenses});

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const IncomeVsExpenses = async (req, res) => {
    const { startDate, endDate, time_period, category, tags, type } = req.query;

    let matchStage ={};

    if (startDate && endDate) {
        matchStage.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }


    if (category && typeof category === 'string') {
        matchStage.category = { $regex: category, $options: 'i' };
    }


    if (type && typeof type === 'string') {
        matchStage.type = { $regex: type, $options: 'i' };
    }

    if (tags && typeof tags === 'string') {
        let tagsArray = tags.split(",").map(temp => temp.trim().toLowerCase());
        matchStage.tags = { $in: tagsArray };
    }

    let dateGrouping;
    switch (time_period?.toLowerCase()) {
        case 'daily':
            dateGrouping = { $dateToString: { format: '%d-%m-%Y', date: "$createdAt" } };
            break;
        case 'weekly':
            dateGrouping = {
                $concat: [
                    { $toString: { $week: "$createdAt" } }, "-",
                    { $toString: { $year: "$createdAt" } }
                ]
            };
            break;
        case 'yearly':
            dateGrouping = { $toString: { $year: "$createdAt" } };
            break;
        default:
            dateGrouping = { $dateToString: { format: "%B-%Y", date: "$createdAt" } };
            break;
    }

    try {

        const incomeVsExpenses = await Transactions.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { time_period: dateGrouping },
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] }
                    },
                    totalExpenses: {
                        $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] }
                    },
                    netBalance: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "Income"] }, "$amount", { $multiply: ["$amount", -1] }
                            ]
                        }
                    }
                }
            }
        ]);
        res.status(200).json({ message: "Income & Expanse", data:incomeVsExpenses});


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    generateSpendingTrendReportById,generateSpendingTrendReport,IncomeVsExpenses,IncomeVsExpensesById
};