const express=require("express");
const router=express.Router();
const {register,login,changepass,forgotpass,resetpass,forgotpassOTP}=require("../controller/userController");
const auth=require("../middleware/auth");

router.post("/register",register);
router.post("/login",login);
router.post("/changepass",auth,changepass);
router.post("/forgotpass",forgotpass);
router.post("/resetpass/:token",resetpass);
router.post("/forgotpassotp",forgotpassOTP);

module.exports=router;