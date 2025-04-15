const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const JWT_SECRET = process.env.JWT_SECRET;

const signUp = async (req, res) => {
    try {
        const {username,password,email,role} = req.body;
        const userExist = await User.findOne({username});
        if (userExist) {
            return res.status(409).json({error: 'User already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const userObj = new User({
            username,
            password:hashedPassword,
            email,
            role,
            isActive: true
        });
        await userObj.save();
        res.status(201).json({message:"User successfully registered...",data:userObj});
    }catch (e){
        res.status(500).json({error: e.message});
    }
}

const logIn = async (req, res) => {
    try {
        const {username,password} = req.body;
        const userExist = await User.findOne({username });
        if (!userExist) {
            return res.status(401).json({error: 'User already exists'});
        }
        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            return res.status(401).json({error: 'Invalid password !'});
        }
        const payload = {userId:userExist._id,username:username,role:userExist.role};
        const token = jwt.sign(payload,JWT_SECRET,{expiresIn: '1h'});
        res.status(200).json({message:"Login Success !",token:token});
    }catch (e){
        res.status(500).json({error: e.message});
    }
}

const getAllUsers = async (req, res) => {
    try{
        const { searchText='',page=1,size=10} = req.query;
        const filter= searchText?{$or:[
                {username:{$regex:searchText,$options:"i"}},
                {role:{$regex:searchText,$options:"i"}},
                {email:{$regex:searchText,$options:"i"}}

            ]}:{};
        const allUsers = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip((page-1)*size)
            .limit(parseInt(size));
        const count = await User.countDocuments(filter);
        res.status(200).json({message:"Users List.....",list:allUsers,count:count});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const getByUserId = async (req, res) => {
    try{
        const selectedUser = await User.findById(req.user._id);
        if(!selectedUser){
            return  res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"User found successfully.",User:selectedUser});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const updateUser = async (req, res) => {
    try{
        const updateUser = await User.findByIdAndUpdate(
            req.user._id,
            req.body,
            {
                new:true
            }
        );
        if(!updateUser){
            return res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:`${updateUser.name} updated successfully`,updateUser:updateUser});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

const deleteUser = async (req, res) => {
    try{
        const deleteUser = await User.findByIdAndDelete(req.params.id);
        if(!deleteUser){
            return res.status(404).json({message:"Not Found"});
        }
        res.status(200).json({message:"User deleted",user:deleteUser});
    }catch(e){
        res.status(500).json({error: e.message});
    }
}

module.exports = {
    signUp,logIn,getAllUsers,getByUserId,updateUser,deleteUser
}