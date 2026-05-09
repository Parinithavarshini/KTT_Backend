const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../model/User");
const nodemailer=require("nodemailer");

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
            process.env.JWT_SECRET,
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
const forgotpass=async(req,res)=>{
    try{
        const{email}=req.body||{};
        const emailregex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;   //regex
        if(!email || !emailregex.test(email)){
            return res.status(400).json({
                message:"Invalid Email format"
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
        const reset=jwt.sign(
            {
                id:user.id
            },
            process.env.RESET_SECRET,
            {
                expiresIn:"15m"
            }
        );
        const maillink=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        });
        const resetlink=`http://localhost:3000/resetpass/${reset}`;
        await maillink.sendMail({
            from:"parinithavarshinis.22csd@kongu.edu",
            to:email,
            subject:"Password Reset link",
            text:`Click this link to reset password: ${resetlink}`
        });
        res.status(200).json({
            message:"Reset link sent successfully",
            token:reset
        });
    }
    catch(err){
        res.status(500).json({
            error:err.message
        });
    }
}
const resetpass=async(req,res)=>{
    try{
        const {newpass}=req.body||{};
        if(!newpass){
            return res.status(400).json({
                message:"New password is required"
            });
        }
        const token=req.params.token;
        const original=jwt.verify(token,process.env.RESET_SECRET);
        const user=await User.findByPk(original.id);
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }
        const hashpass=await bcrypt.hash(newpass,10);
        user.password=hashpass;
        await user.save();
        res.status(200).json({
            message:"Password reset is successful"
        });
    }
    catch(err){
        res.status(500).json({
            error:err.message
        });
    }
};
const forgotpassOTP=async(req,res)=>{
    try{
        const{email}=req.body||{};
        const emailregex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;  
        if(!email || !emailregex.test(email)){
            return res.status(400).json({
                message:"Invalid Email format"
            });
        }
        const user=await User.findOne({
            attributes: ['id'], 
            where:{email}
        });
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }
        const otp=Math.floor(100000+Math.random()*900000).toString();
        user.resetOTP=otp;
        user.otpExpiry=new Date(Date.now()+5*60*1000); 
        await user.save();
        const maillink=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        });
        await maillink.sendMail({
            from:"parinithavarshinis.22csd@kongu.edu",
            to:email,
            subject:"Password Reset OTP",
            text:`OTP :${otp}. Valid for 5 mins`
        });
        res.status(200).json({
            message:"OTP sent successfully"
        });
    }
    catch(err){
        res.status(500).json({
            error:err.message
        });
    }
}

module.exports={register,login,changepass,forgotpass,resetpass,forgotpassOTP};
