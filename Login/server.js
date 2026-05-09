const express=require("express");
const bodyParser=require("body-parser");
const sequelize=require("./config/db");
const userRoute=require("./Route/userRoute");
require("dotenv").config();

const app=express();
app.use(bodyParser.json());
app.use("/",userRoute);
sequelize.sync({alter:true}).then(()=>{
    app.listen(3000,()=>{
        console.log("Server running on port 3000");
    });
})
.catch((err)=>{
    console.log(err);
});