const express = require("express");
const sequelize = require("./config/db");
const studentRoutes = require("./routes/studentroute");
const Student = require("./models/student");
const Data = require("./models/data");
const Course = require("./models/Course");
const app = express();
app.use(express.json());

// Association               -hasOne()-one to one,hasMany()-one to many,belongsTo()-foreign key refernces the parent
Student.hasOne(Data);        //hasMany the output is given as array
Data.belongsTo(Student);  
// Student.hasMany(Course);       
// Course.belongsTo(Student);
// Data.belongsTo(Student);
// Routes
app.use("/",studentRoutes);

// Create Data
app.post("/data",async(req,res)=>{
   const data = await Data.create(req.body);
   res.json(data);
});

// Eager Loading
app.get("/studentdata",async(req,res)=>{
   const students = await Student.findAll({
      include:Data
   });
   res.json(students);
});

//Lazy Loading
app.get("/lazy",async(req,res)=>{
   const student = await Student.findByPk(2);
   const data = await student.getDatum();
   res.json(data)
});

sequelize.sync();
app.listen(4000,()=>{
   console.log("Server running");
});