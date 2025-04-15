const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        min: 0,
        required: true,
    },
    type: {
        type: String,
        enum: ['Income', 'Expense'],
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    currency: {
        type: String,
        required: true
    },
    convertedAmount: {
        type: Number
    },
    baseCurrency: {
        type: String,
        default: "USD"
    },
    recurrence: {
        type: Boolean,
        default: false,
    },
    recurrencePattern: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly'],
        required: function (){return this.recurrence;},
    },
    startDate: {
        type: Date,
        required: function (){return this.recurrence;},
    },
    endDate: {
        type: Date,
        required: function (){return this.recurrence;},
    }

})

module.exports = mongoose.model("Transaction", transactionSchema);