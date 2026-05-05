const Student=require("../models/Student");
exports.getStudents=async(req,res)=>{
    const students=await Student.findAll();
    res.render("form",{students});
};
exports.addStudent=async(req,res)=>{
    await Student.create(req.body);
    res.redirect("/students");
};
exports.updateStudent=async(req,res)=>{
  await Student.update(req.body,{
    where:{id:req.params.id}
  });
  res.redirect("/students");
};
exports.deleteStudent=async(req,res)=>{
    await Student.destroy({
        where:{id:req.params.id},
    });
    res.redirect("/students");
};
exports.editPage=async(req,res)=>{
    const student = await Student.findByPk(req.params.id);
    res.render("edit",{student});
};
