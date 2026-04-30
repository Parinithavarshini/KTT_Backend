const express=require("express");
const router=express.Router();
const user=require("../controllers/usercontrol");
const auth=require("../middleware/auth");
router.post("/users",user.createUser);//
router.get("/users",auth,user.getUsers);
router.get("/users/:id",auth,user.getoneUsers);
router.put("/users/:id",user.updateUser);//
router.delete("/users/:id",user.deleteUser);//

router.post("/register",user.registerUser);
router.post("/login",user.loginUser); // password verify
module.exports = router;