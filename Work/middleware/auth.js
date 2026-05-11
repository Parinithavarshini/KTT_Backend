const jwt=require("jsonwebtoken");

const auth=(req,res,next)=>{
    console.log("TOKEN:",req.headers.token);
    const token = req.headers.token;
    if(!token){
        return res.status(401).json({
            message:"Token is not given"
        });
    }
    try{
        const original=jwt.verify(token,process.env.JWT_SECRET);
        res.locals.user = original;
        console.log("USER:",res.locals.user);
        next();
    }
    catch{
        res.status(401).json({
            message:"Invalid token"
        });
    }
};

module.exports = auth;