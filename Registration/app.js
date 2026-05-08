const express=require("express");
const path=require("path");
const sequelize=require("./config/db");
require("./models/User");
require("./models/Student");
const session=require("express-session");
const authRoutes=require("./routes/authRoutes");
const studentRoutes=require("./routes/studentRoutes");

const app=express();
app.use(express.urlencoded({extended:true}));
app.use(
  session({secret:"secretkey",resave:false,saveUninitialized:false})
);
app.use(express.static(path.join(__dirname,"public")));
app.use("/",authRoutes);
app.use("/students", studentRoutes);
app.set("view engine","pug"); //
app.set("views",path.join(__dirname,"views"));
app.get("/",(req,res)=>{
    res.render("login");
});
app.get("/form",(req,res)=>{
    res.render("form");
});
sequelize.sync().then(()=>{
    app.listen(3001,()=>{
        console.log("Server running in port 3001");
    });
});





//Templete engine - pug,ejs,Handlebars