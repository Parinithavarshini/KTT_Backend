const bcrypt=require("bcryptjs");        //encrypt password
const jwt=require("jsonwebtoken");       //create token after login
const User=require("../models/usermodel") 
exports.createUser=async(req,res)=>{
  const {username,password,district,email,mobile,role,branch,status}=req.body|| {}; //
  if(!username||!district||!email||!mobile||!role||!branch||!status){
    return res.send("All fields required");
  }
  try{
    const user=await User.create({username,district,email,mobile,role,branch,status});
    res.send(user);
  }
  catch(err){
    res.send("Something wrong");
  }
};
exports.getUsers=async(req,res)=>{
  const users=await User.findByPk(req.user.id);
  res.json(users);
};
exports.getoneUsers=async(req,res)=>{
  const useros=await User.findByPk(req.params.id);
  res.json(useros);
};
exports.updateUser=async(req, res)=>{
  await User.update(req.body,{
    where:{id:req.params.id},
  });
  res.send("Updated");
};
exports.deleteUser=async(req,res)=>{
  await User.destroy({
    where:{id:req.params.id },
  });
  res.send("Deleted");
};
exports.registerUser=async(req,res)=>{
  const{username,password,district,email,mobile,role,branch,status}=req.body; // 
  if(!email||!password){
    return res.send("Email and password must");
  }
  try{
    const hashedpass=await bcrypt.hash(password,10);
    const user=await User.create({username,password:hashedpass,district,email,mobile,role,branch,status});
    res.send(user);
  }
  catch(err){
    res.send(err);
  }
};
exports.loginUser=async(req,res)=>{
  const{email,password}=req.body;
  try{
    const user=await User.findOne({
      where:{email}
    });
    if(!user){
      return res.send("User not found");
    }
    const validpass=await bcrypt.compare(
      password,user.password
    );
    if(!validpass){
      return res.send("Invalid password");
    }
    const token=jwt.sign({id:user.id},"secretkey");
    res.json({token});
  }
  catch(err){
    res.send(err);
  }
};