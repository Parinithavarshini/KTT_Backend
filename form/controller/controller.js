const Student=require("../models/student");
exports.newStudent=async(req,res)=>{
  const student=await Student.create(req.body);
  res.json(student);
};
exports.getStudents=async(req,res)=>{
  const students=await Student.findAll();
  res.json(students);
};
exports.getStudent=async(req,res)=>{
  const student=await Student.findByPk(req.params.id);
  res.json(student);
};
exports.updateStudent=async(req,res)=>{
  await Student.update(req.body,{
    where:{id:req.params.id}
  });
  res.send("Updated");
};
exports.deleteStudent=async(req,res)=>{
  await Student.destroy({
    where:{id:req.params.id}
  });
  res.send("Deleted");
};