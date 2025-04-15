const Transaction = require("../model/transactionModel");
const Budget = require("../model/budgetModel");
const Goal = require("../model/goalsAndSavingsModel");
const {convertCurrency} = require("../util/exchangeRate");


const createTransaction = async (req, res) => {
    try {
        const {amount,currency,baseCurrency} = req.body

        if (!amount || !currency || !baseCurrency) {
            return res.status(400).json({ error: "Missing required fields: amount, currency, or baseCurrency" });
        }
        const convertedAmount = await convertCurrency(amount, currency, baseCurrency);

        const transaction = new Transaction({
            ...req.body,
            amount: convertedAmount,
            currency: currency,
            baseCurrency: baseCurrency,
        });

        const allocationResult = await Goal.autoAllocation(transaction);

        if (allocationResult && allocationResult.remainingTransactionAmount === undefined) {
            transaction.amount = allocationResult.remainingTransactionAmount;
        }
        transaction.amount = amount;
        await transaction.save();

        try {
            await Budget.UpdateBudgetOnTransaction(transaction);

        } catch (budgetError) {
            console.error("Failed to update budget:", budgetError.message);
        }

        res.status(201).json({message:"Transaction created successfully.",transaction:transaction,allocationResult:allocationResult});
    }catch (e) {
        res.status(500).json({message:"Could not create transaction.",error: e.message});
    }
}

const getAllTransaction = async (req, res) => {
    try{
        const { searchText='',page=1,size=10} = req.query;
        const filter= searchText?{$or:[
                {type:{$regex:searchText,$options:"i"}},
                {category:{$regex:searchText,$options:"i"}},
                {tags:{$elemMatch:{$regex:searchText,$options:"i"}}},
                {recurrencePattern:{$regex:searchText,$options:"i"}},

            ]}:{};
        const allTransactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip((page-1)*size)
            .limit(parseInt(size));
        const count = await Transaction.countDocuments(filter);
        res.status(200).json({message:"Transactions List.....",list:allTransactions,count:count});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const getByTransactionId = async (req, res) => {
    try{
        const selectedTransaction = await Transaction.findById(req.params.id);
        if(!selectedTransaction){
            return  res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"Transaction found successfully.",transaction:selectedTransaction});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const updateTransaction = async (req, res) => {
    try{
        const updateTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true
            }
        );
        if(!updateTransaction){
            return res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"Transaction updated successfully.",transaction:updateTransaction});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const deleteTransaction = async (req, res) => {
    try{
        const deleteTransaction = await Transaction.findByIdAndDelete(req.params.id);
        if(!deleteTransaction){
            return res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"Transaction deleted",transaction:deleteTransaction});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

module.exports = {
    createTransaction,getAllTransaction,getByTransactionId,updateTransaction,deleteTransaction
}