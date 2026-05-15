const express=require("express");
const app=express();
require("./config/db");
app.use(express.json());
const userRoutes=require("./routes");
app.use("/users",userRoutes);
app.listen(3000,()=>{
    console.log("Server running on port 3000");
});