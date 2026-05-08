const jwt=require("jsonwebtoken");

const auth=(req,res,next)=>{
    const token=req.headers.token; //
    if(!token){
        return res.status(401).json({
            message:"Token not found"
        });
    }
    try{
        const original=jwt.verify(token,"login_secretkey_123");
        res.locals.user=original;
        next();
    }
    catch(err){
        res.status(401).json({
            message:"Invalid token is given"
        });
    }
};

module.exports=auth;
