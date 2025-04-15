const mongoose = require('mongoose');


const exchangeRateSchema = new mongoose.Schema({
    baseCurrency: {
        type: String,
        default: "USD"
    },
    rates: {
        type: Object,
        required: true
    }, // Stores exchange rates (e.g., {EUR: 0.92, GBP: 0.78})
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("ExchangeRate", exchangeRateSchema);