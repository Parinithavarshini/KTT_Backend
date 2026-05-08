const jwt=require("jsonwebtoken");
module.exports=(req,res,next)=>{
    const token=req.header("token");
    if(!token){
        return res.send("Access denied");
    }
    try{
        const decoded=jwt.verify(token,"secretkey");
        req.user=decoded; //res.locals
        next();
    }
    catch(err){
        res.send(err);
    }
};