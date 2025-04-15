const Goals = require("../model/goalsAndSavingsModel")



const createGoal = async (req, res) => {
    try{
        const goal = new Goals(req.body);
        await goal.save();
        res.status(201).json({message:"Goal created successfully.",goal:goal});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const getAllGoals = async (req, res) => {
    try{
        const { searchText='',page=1,size=10} = req.query;
        const filter = searchText
            ? { category: { $regex: searchText, $options: "i" } }
            : {};
        const allGoals = await Goals.find(filter)
            .sort({ createdAt: -1 })
            .skip((page-1)*size)
            .limit(parseInt(size));
        const count = await Goals.countDocuments(filter);
        res.status(200).json({message:"Budget List.....",list:allGoals,count:count});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const getByGoalId = async (req, res) => {
    try{
        const selectedGoal = await Goals.findById(req.params.id);
        if(!selectedGoal){
            return  res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"Goal found successfully.",budget:selectedGoal});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const updateGoal = async (req, res) => {
    try{
        const updatedGoal = await Goals.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true
            }
        );
        if(!updatedGoal){
            return res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"Goal updated successfully.",budget:updatedGoal});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const deleteGoal = async (req, res) => {
    try{
        const deletedGoal = await Goals.findByIdAndDelete(req.params.id);
        if(!deletedGoal){
            return res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"Goal deleted",budget:deletedGoal});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const updateProgress = async (req, res) => {
    try{
       const {amount} = req.body;
       if(typeof amount !== 'number'|| amount <= 0){
           return res.status(400).json({message:"Amount must be a positive number."});
       }
       const goal = await Goals.findById(req.params.id);
       if(!goal){
           return res.status(404).json({message:"Not Found"});
       }
       goal.currentAmount += amount;
       goal.transactions.push({amount,date:new Date()});

       await goal.save();
       res.status(200).json({message:"Goal amount update successfully",budget:amount});

    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const isComplete = async (req, res) => {
    try{

        const goal = await Goals.findById(req.params.id);
        if(!goal){
            return res.status(404).json({message:"Not Found"});
        }
       const isComplete = goal.currentAmount >= goal.targetAmount
        if(!isComplete){
            return res.status(200).json({message:"goal is not complete yet"});
        }
        res.status(200).json({message:"goal is completed successfully."});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

module.exports = {
    createGoal,getAllGoals,getByGoalId,updateGoal,deleteGoal,updateProgress,isComplete,
}