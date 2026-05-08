const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../model/User");

const register=async(req,res)=>{
    try{
        if(!req.body||Object.keys(req.body).length===0){
            return res.status(400).json({
                message:"Request body is empty"
            });
        }
        const{name,password,email,phone}=req.body;
        if(!name || !password || !email || !phone){
            return res.status(400).json({
                message:"All fields should be filled"
            });
        }
        const olduser=await User.findOne({
            where:{email:email}
        });
        if(olduser){
            return res.status(400).json({
                message:"The user already exists"
            });
        }
        const hashpass=await bcrypt.hash(password,10);
        const newuser=await User.create({
            name,password:hashpass,email,phone
        });
        res.status(201).json({
            message:"User registered successfully",newuser
        });
    }
    catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};
const login=async(req,res)=>{
    try{
        if(!req.body||Object.keys(req.body).length===0){
            return res.status(400).json({
                message:"Request body is empty"
            });
        }
        const{email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({
                message:"Email and password required"
            });
        }
        const user=await User.findOne({
            where:{email:email}
        });
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }
        const match=await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({
                message:"Invalid password"
            });
        }
        const token=jwt.sign(
            {
                id:user.id,
                email:user.email
            },
            "login_secretkey_123",
            {
                expiresIn:"3h"
            }
        );
        return res.status(200).json({
            message:"Login done",token
        });
    }
    catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};
const changepass=async(req,res)=>{
    try{
        if(!req.body||Object.keys(req.body).length===0){
            return res.status(400).json({
                message:"Request body is empty"
            });
        }
        const {oldpass,newpass}=req.body || {}; 
        const userId=res.locals.user.id;
        const user=await User.findByPk(userId);
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }
        const match=await bcrypt.compare(oldpass,user.password);
        if(!match){
            return res.status(400).json({
                message:"Your old password in wrong"
            });
        }
        const hashpass=await bcrypt.hash(newpass,10);
        user.password=hashpass;
        await user.save();
        res.status(200).json({
            message:"Password changed successfully"
        });
    }
    catch(err){
        res.status(500).json({
            error:err.message
        });
    }
}

module.exports={register,login,changepass};
