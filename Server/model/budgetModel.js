const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const budgetSchema = new mongoose.Schema({
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category: {
            type: String,
        },
        timePeriod: {
            type:String,
        },
        amount: {
            type: Number,
            default: 0,
            required: true
        },
        spent:{
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
)
budgetSchema.statics.UpdateBudgetOnTransaction = async function (transaction) {
    try {
        if (transaction.type === "Expense") {
            const budget = await this.findOne({
                userId: transaction.userId,
                category: transaction.category
            });
            console.log(budget);
            if (!budget) {
                console.warn(` No budget found for user ${transaction.userId} and category ${transaction.category}`);
                return { message: "No budget found." };
            }

            budget.spent += transaction.amount;
            if(budget.spent >= budget.amount){
                console.log(`Alert: exceeded budget limit for ${budget.category}`)
            }
            if (budget.spent > budget.amount * 0.9 && budget.spent < budget.amount ) {
                console.log(`Alert: nearing budget limit for ${budget.category}`);
            }

            await budget.save();
            console.log(  `Budget spent amount =  ${budget.spent} is updated successfully with transaction amount = ${ transaction.amount }`);
        }
    } catch (e) {
        console.error("Error in UpdateBudgetOnTransaction:", e.message);
        throw new Error(e.message);
    }
};

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;