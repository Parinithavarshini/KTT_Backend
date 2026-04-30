const express=require("express");
const path=require("path");

const app=express();
app.use(express.urlencoded({ extended: true }));

app.set("view engine","pug");
app.set("views",path.join(__dirname,"views"));

app.listen(3001,()=>{
    console.log("Server running on http://localhost:3001");
});