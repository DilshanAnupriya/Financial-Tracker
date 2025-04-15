const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deadline: {
        type: Date
    },
    category: {
        type: String,
        enum: ["Emergency Fund", "Vacation", "Car", "House", "Other"],
        default: "Other"
    },
    autoAllocate: {
        type: Boolean,
        default: false
    },
    allocationPercentage: {
        type: Number,
        min: 0,
        max: 100,
        required:true
    }, 
    transactions: [
        {
            amount: {
                type: Number,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
});
GoalSchema.statics.autoAllocation = async function (transaction) {
    try {
        if (transaction.type !== "Income") {
            return { message: "No auto allocation for non-income transactions." };
        }

        const goals = await this.find({
            userId: transaction.userId,
            autoAllocate: true
        });

        if (!goals.length) {
            return { message: "Auto allocation not applicable.", remainingTransactionAmount: transaction.amount };
        }

        let totalAllocated = 0;
        for (const goal of goals) {
            const allocationAmount = (transaction.amount * goal.allocationPercentage) / 100;
            goal.currentAmount += allocationAmount;
            goal.transactions.push({ amount: allocationAmount, date: new Date() });
            await goal.save();
            totalAllocated += allocationAmount;
        }

        const remainingTransactionAmount = transaction.amount - totalAllocated;

        return {
            message: "Funds auto-allocated successfully.",
            remainingTransactionAmount
        };

    } catch (e) {
        console.error("Error in auto allocation: ", e.message);
        return { message: "Error in auto allocation.", error: e.message };
    }
};


const Goal = mongoose.model("Goal", GoalSchema);
module.exports = Goal;
