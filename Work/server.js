const express=require("express");
const sequelize=require("./config/db");
const userRoutes=require("./routes/userRoutes");
const attendanceRoutes=require("./routes/attendanceRoutes");
require("dotenv").config();
const app=express();
app.use(express.json());
app.use("/user",userRoutes);
app.use("/attendance",attendanceRoutes);

sequelize.sync({alter:true})
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server running on port ${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.log(err);
});