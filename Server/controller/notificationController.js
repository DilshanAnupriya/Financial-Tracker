const Notification = require('../model/notificationModel');
const NotificationService = require('../service/notificationService');
const Goal = require('../model/goalsAndSavingsModel');
const Transaction = require('../model/transactionModel');
const Budget = require('../model/budgetModel');

const notifyDeadline = async (req, res) => {
    try {
        const { id } = req.params;
        const today = new Date();
        const threeDaysBefore = new Date();
        threeDaysBefore.setDate(today.getDate() + 3);

        const goalDeadline = await Goal.find({
            userId: id, // Filter by user ID
            deadline: {
                $gte: threeDaysBefore.setHours(0, 0, 0, 0),
                $lt: threeDaysBefore.setHours(23, 59, 59, 999)
            }
        });

        if (!goalDeadline.length) {
            return res.status(200).json({ message: "No goals with upcoming deadlines for this user" });
        }

        const notifications = [];
        for (const goal of goalDeadline) {
            const message = `Reminder: Your goal '${goal.name}' is due in 3 days (${goal.deadline.toDateString()}). Stay on track!`;

            const notification = await NotificationService.createNotification(
                "system",
                id,
                message,
                "deadline"
            );
            notifications.push(notification);
        }

        res.status(201).json({ message: "Notifications sent", notifications });

    } catch (e) {
        console.error("Error sending deadline notifications:", e);
        res.status(500).json({ message: e.message });
    }
};

const upcomingTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const now = new Date();
        const threeDaysBefore = new Date(now);
        threeDaysBefore.setDate(now.getDate() + 3);

        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() + 7);

        const recurringTransactions = await Transaction.find({ userId: id, recurrence: true });

        const notifications = [];

        for (const transaction of recurringTransactions) {
            let shouldNotify = false;

            if (transaction.recurrencePattern === 'Daily') {
                shouldNotify = true;
            } else if (transaction.recurrencePattern === 'Weekly') {
                const nextWeekly = new Date(transaction.startDate);
                nextWeekly.setDate(nextWeekly.getDate() + 7);
                if (nextWeekly.toDateString() === threeDaysBefore.toDateString()) {
                    shouldNotify = true;
                }
            } else if (transaction.recurrencePattern === 'Monthly') {
                const nextMonthly = new Date(transaction.startDate);
                nextMonthly.setMonth(nextMonthly.getMonth() + 1);
                if (nextMonthly.toDateString() === lastWeek.toDateString()) {
                    shouldNotify = true;
                }
            }

            if (shouldNotify) {
                const message = `Reminder: Your recurring transaction of ${transaction.amount} ${transaction.currency} for '${transaction.category}' is coming up soon.`;

                const notification = await NotificationService.createNotification(
                    "system",
                    id,
                    message,
                    "reminder"
                );

                notifications.push(notification);
            }
        }

        res.status(200).json({ message: "Upcoming transaction notifications sent", notifications });

    } catch (e) {
        console.error("Error sending upcoming transaction notifications:", e);
        res.status(500).json({ message: e.message });
    }
};

const upcomingGoals = async (req, res) => {
    try {
        const { id } = req.params;
        const today = new Date();
        const weekLater = new Date(today);
        weekLater.setDate(today.getDate() + 7);

        const startOfDay = new Date(weekLater);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(weekLater);
        endOfDay.setHours(23, 59, 59, 999);

        const upcomingGoals = await Goal.find({
            userId: id,
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        if (!upcomingGoals.length) {
            return res.status(200).json({ message: "No upcoming goals for this user." });
        }

        const notifications = [];
        for (const goal of upcomingGoals) {
            const message = `Reminder: Your goal '${goal.name}' will start in a week (${goal.createdAt.toDateString()}). Stay on track!`;

            const notification = await NotificationService.createNotification(
                "system",
                id,
                message,
                "upcoming_goal"
            );
            notifications.push(notification);
        }

        res.status(201).json({ message: "Notifications sent", notifications });

    } catch (err) {
        console.error("Error sending upcoming goal notifications:", err);
        res.status(500).json({ message: err.message });
    }
};

const notifyBudget = async (req, res) => {
    try {
        const { id } = req.params;

        const budgets = await Budget.find({ userId: id });
        const notifications = [];
        const thresholdPercentage = 0.8;

        for (const budget of budgets) {
            const percentageSpent = budget.spent / budget.amount;

            if (percentageSpent >= 1) {
                const message = `Alert: Your budget for '${budget.category}' has been exceeded! You spent ${budget.spent} out of ${budget.amount}.`;

                const notification = await NotificationService.createNotification(
                    "system",
                    id,
                    message,
                    "budget_exceeded"
                );
                notifications.push(notification);
            } else if (percentageSpent >= thresholdPercentage) {
                const message = `Alert: Your budget for '${budget.category}' is nearing the limit! You have spent ${budget.spent} out of ${budget.amount}.`;

                const notification = await NotificationService.createNotification(
                    "system",
                    id,
                    message,
                    "budget_nearing"
                );
                notifications.push(notification);
            }
        }

        if (notifications.length > 0) {
            res.status(200).json({ message: "Budget notifications sent", notifications });
        } else {
            res.status(200).json({ message: "No budget limits exceeded or nearing" });
        }

    } catch (e) {
        console.error("Error sending budget notifications:", e);
        res.status(500).json({ message: e.message });
    }
};

module.exports = {
    upcomingGoals,
    notifyDeadline,
    upcomingTransaction,
    notifyBudget
};
