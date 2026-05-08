const express=require("express");
const router=express.Router();
const {register,login,changepass}=require("../controller/userController");
const auth=require("../middleware/auth");

router.post("/register",register);
router.post("/login",login);
router.post("/changepass",auth,changepass);

module.exports=router;