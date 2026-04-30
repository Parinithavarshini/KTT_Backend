const express=require("express");
const bodyParser=require("body-parser");
const sequelize=require("./config/db");
const userRoutes=require("./routes/userroute");

const app=express();
app.use(bodyParser.json());
app.use("/",userRoutes);
sequelize.sync({alter:true}).then(()=>{
  console.log("DB connected");
});
app.listen(3000,()=>{
  console.log("Server running on port 3000");
});

//npm install bcryptjs jsonwebtoken