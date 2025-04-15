const cron = require("node-cron");
const axios = require("axios");
const ExchangeRate = require("../model/excgangeRateModel");
require("dotenv").config();

// Fetch exchange rates from API
const fetchExchangeRates = async () => {
    try {
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;
        const baseCurrency = process.env.BASE_CURRENCY || "USD";
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`;

        const response = await axios.get(url);
        const rates = response.data.conversion_rates;

        if (!rates) throw new Error("Failed to fetch exchange rates");

        // Update exchange rates in the database
        await ExchangeRate.findOneAndUpdate(
            { baseCurrency },
            { rates, lastUpdated: new Date() },
            { upsert: true, new: true }
        );

        console.log("Exchange rates updated:", new Date());
    } catch (error) {
        console.error("Exchange rate update failed:", error.message);
    }
};

// Run every hour
cron.schedule("0 * * * *", fetchExchangeRates);

// Fetch on server start
fetchExchangeRates();



const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount; // No conversion needed

    // Fetch exchange rates from the database
    const exchangeRate = await ExchangeRate.findOne({ baseCurrency: "USD" });
    if (!exchangeRate || !exchangeRate.rates[fromCurrency] || !exchangeRate.rates[toCurrency]) {
        throw new Error("Exchange rates not available");
    }

    // Convert amount to USD first, then to target currency
    const amountInUSD = amount / exchangeRate.rates[fromCurrency];
    return amountInUSD * exchangeRate.rates[toCurrency];
};



module.exports = { fetchExchangeRates,convertCurrency };
