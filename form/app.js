const express = require("express");
const sequelize = require("./config/db");
const studentRoutes = require("./routes/studentroute");
const Student = require("./models/student");
const Data = require("./models/data");
const Course = require("./models/Course");
const Subject=require("./models/subject");
const app = express();
app.use(express.json());

// Routes
app.use("/",studentRoutes);

// Create Data
app.post("/data",async(req,res)=>{
   const data = await Data.create(req.body);
   res.json(data);
});
//create course
app.post("/course",async(req,res)=>{
   const course = await Course.create(req.body);
   res.json(course);
});
//create subject
app.post("/subject",async(req,res)=>{
   const subject=await Subject.create(req.body);
   res.json(subject);
});
//belongsToMany
app.post("/connect",async(req,res)=>{
   const student=await Student.findByPk(req.body.studentId);
   const subject=await Subject.findByPk(req.body.subjectId);
   await student.addSubject(subject);
   res.send("Connected");
});
app.get("/many",async(req,res)=>{
   const students=await Student.findAll({
      include:Subject
   });
   res.json(students);
});
//hasMany()
app.get("/eagercourse",async(req,res)=>{
   const students=await Student.findAll({
      include:Course
   });
   res.json(students);
});
app.get("/lazycourse",async(req,res)=>{
   const student=await Student.findByPk(1);
   const courses=await student.getCourses();
   res.json(courses);
});

//hasOne()
app.get("/eager",async(req,res)=>{
   const students = await Student.findAll({
      include:Data
   });
   res.json(students);
});
app.get("/lazy",async(req,res)=>{
   const student = await Student.findByPk(1);
   const data = await student.getDatum();
   res.json(student)
});
app.get("/load",async(req,res)=>{
   const student=await Student.findAll();
   res.json(student)
});
sequelize.sync().then(()=>{
   app.listen(4000,()=>{
      console.log("Server running");
   });
});