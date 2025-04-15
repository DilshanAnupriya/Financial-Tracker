const Budget = require("../model/budgetModel")
const res = require("express/lib/response");

const createBudget = async (req, res) => {
    try{
        const budget = new Budget(req.body);
        await budget.save();
        res.status(201).json({message:"Budget created successfully.",budget:budget});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const getAllBudget = async (req, res) => {
    try{
        const { searchText='',page=1,size=10} = req.query;
        const filter = searchText
            ? { category: { $regex: searchText, $options: "i" } }
            : {};
        const allBudget = await Budget.find(filter)
            .sort({ createdAt: -1 })
            .skip((page-1)*size)
            .limit(parseInt(size));
        const count = await Budget.countDocuments(filter);
        res.status(200).json({message:"Budget List.....",list:allBudget,count:count});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const getByBudgetId = async (req, res) => {
    try{
        const selectedBudget = await Budget.findById(req.params.id);
        if(!selectedBudget){
            return  res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"Budget found successfully.",budget:selectedBudget});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const updateBudget = async (req, res) => {
    try{
        const updateBudget = await Budget.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true
            }
        );
        if(!updateBudget){
            return res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"Budget updated successfully.",budget:updateBudget});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const deleteBudget = async (req, res) => {
    try{
        const deleteBudget = await Budget.findByIdAndDelete(req.params.id);
        if(!deleteBudget){
            return res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"Budget deleted",budget:deleteBudget});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const UpdateBudgetOnTransaction = async (transaction) => {
    try{
        if(transaction.type === 'Expense'){
            const budget =
                await Budget.findOne({userId:transaction.userId,category:transaction.category});
            if(budget){
                budget.spent += transaction.amount;

                if(budget.spent > budget.amount * 0.9){
                    console.log(`Alert: nearing budget limit for ${budget.category}`);
                }
            }
            await budget.save();
        }
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const budgetRecommendations = async (req,res) => {
    try{
        let recommendations
        const budget =  await Budget.find({userId: req.params.id});
        if(!budget){
            return res.status(404).json({message:"Not Found"});
        }else if(budget){
            if(budget.spent > budget.amount){
                recommendations = "Reduce expenses or increase budget.";
            }else if(budget.spent > budget.amount * 0.8){
                recommendations = "You are nearing your budget limit..";
            }else {
                recommendations = "Budget is within limits";
            }
        }

        res.status(200).json({Recommendations:recommendations,Category:budget.category,
            Amount:budget.amount,Spent:budget.spent});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

module.exports = {
    createBudget,getAllBudget,getByBudgetId,updateBudget,deleteBudget,UpdateBudgetOnTransaction,budgetRecommendations
}