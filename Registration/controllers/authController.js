const bcrypt = require("bcrypt");
const User = require("../models/User");
exports.getLogin=(req,res)=>{
  res.render("login");
};
exports.postLogin=async(req,res)=>{
  const {username,password}=req.body;
  let user=await User.findOne({
    where:{username}
  });
  if(!user){
    const hashedPassword=await bcrypt.hash(password,10);
    user=await User.create({username,password: hashedPassword});
  }
  const validPassword=await bcrypt.compare(password,user.password);
  if (!validPassword){
    return res.send("Invalid Password");
  }
  req.session.userId=user.id;
  res.redirect("/students");
};