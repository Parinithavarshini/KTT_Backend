const express=require("express");
const router=express.Router();
const studController=require("../controller/controller");
router.post("/students",studController.newStudent);
router.get("/students",studController.getStudents);
router.get("/students/:id",studController.getStudent);
router.put("/students/:id",studController.updateStudent);
router.delete("/students/:id",studController.deleteStudent);
module.exports = router;