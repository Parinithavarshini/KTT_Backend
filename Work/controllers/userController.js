const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User");

const register=async(req,res)=>{
    try{
        const {name,email,password,phone}=req.body||{};
        if(!name||!email||!password||!phone){
            return res.status(400).json({
                message:"All fields are mandatory for registration"
            });
        }
        const oldUser=await User.findOne({
            where:{email}
        });
        if(oldUser){
            res.status(400).json({
                message:"User already exists"
            });
        }
        const hashpass=await bcrypt.hash(password,10);
        const user=await User.create({name,email,password:hashpass,phone});
        res.status(201).json({
            message:"User registartion successful"
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
        const{email,password}=req.body||{};
        if(!email||!password){
            return res.status(400).json({
                message:"Email and password required"
            });
        }
        const user=await User.findOne({
            where:{email}
        });
        if(!user){
            return res.status(400).json({
                message:"User not found"
            });
        }
        const match=await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(400).json({
                message:"Invalid password given"
            });
        }
        const token=jwt.sign(
            {
                id:user.id,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        );
        res.status(200).json({
            message:"Login successful",token
        });
    }
    catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};

module.exports={register,login};