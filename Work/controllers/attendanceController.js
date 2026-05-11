const Attendance=require("../models/Attendance");

const getToday=()=>{
    const d=new Date();
    return d.toISOString().split("T")[0];
};
const toMinutes=(time)=>{
    const [h,m]=time.split(":");
    return Number(h)*60+Number(m);
};
const getMinutes=(date)=>{
    return date.getHours()*60+date.getMinutes();
};
const checkIn=async(req,res)=>{
    try{
        let now;
        let currentMinutes;
        if(req.body&&req.body.time){
            now=new Date();
            const [h,m]=req.body.time.split(":");
            now.setHours(Number(h),Number(m),0,0);
            currentMinutes=toMinutes(req.body.time);
        }else{
            now=new Date();
            currentMinutes=getMinutes(now);
        }
        if(currentMinutes<510){
            return res.status(400).json({
                message:"CheckIn starts at 8:30AM"
            });
        }
        if(currentMinutes>600){
            return res.status(400).json({
                message:"CheckIn ends at 10:00AM"
            });
        }
        const today=getToday()
        const alreadyIn=await Attendance.findOne({
            where:{
                userId:res.locals.user.id,
                date:today
            }
        });
        if(alreadyIn){
            return res.status(400).json({
                message:"Already CheckedIn"
            });
        }
        const attendance=await Attendance.create({
            userId:res.locals.user.id,
            date:today,
            checkIn:now,
            status:"HalfDay"
        });
        return res.status(201).json({
            message:"CheckIn Success",
            attendance
        });
    }
    catch(err){
        return res.status(500).json({
            error:err.message
        });
    }
};

const checkOut=async(req,res)=>{
    try{
        let now;
        let currentMinutes;
        if(req.body&&req.body.time){
            now=new Date();
            const [h,m]=req.body.time.split(":");
            now.setHours(Number(h),Number(m),0,0);
            currentMinutes=toMinutes(req.body.time);
        }else{
            now=new Date();
            currentMinutes=getMinutes(now);
        }
        if(currentMinutes<1050){
            return res.status(400).json({
                message:"CheckOut Starts at 5:30PM"
            });
        }
        if(currentMinutes>1140){
            return res.status(400).json({
                message:"CheckOut Ends at 7:00PM"
            });
        }
        const today=getToday();
        const attendance=await Attendance.findOne({
            where:{
                userId:res.locals.user.id,
                date:today
            }
        });
        if(!attendance){
            return res.status(400).json({
                message:"CheckIn Required"
            });
        }
        if(attendance.checkOut){
            return res.status(400).json({
                message:"Already CheckedOut"
            });
        }
        attendance.checkOut=now;
        const diff=now-new Date(attendance.checkIn);
        const hours=Math.floor(diff/(1000*60*60));
        const mins=Math.floor((diff%(1000*60*60))/(1000*60));
        attendance.duration=`${hours}h${mins}m`;

        const checkInMinutes=
            new Date(attendance.checkIn).getHours()*60+
            new Date(attendance.checkIn).getMinutes();
        if(checkInMinutes<=540&&currentMinutes>=1080){
            attendance.status="FullDay";
        }else{
            attendance.status="HalfDay";
        }
        await attendance.save();
        return res.status(200).json({
            message:"CheckOut Success",
            attendance
        });
    }
    catch(err){
        return res.status(500).json({
            error:err.message
        });
    }
};

const myAttendance=async(req,res)=>{
    try{
        const attendance=await Attendance.findAll({
            where:{
                userId:res.locals.user.id
            }
        });
        return res.status(200).json(attendance);
    }
    catch(err){
        return res.status(500).json({
            error:err.message
        });
    }
};

module.exports={checkIn,checkOut,myAttendance};