const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");
const User=require("./User");

const Attendance=sequelize.define("Attendance",{
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    checkIn:{
        type:DataTypes.DATE,
        allowNull:true
    },
    checkOut:{
        type:DataTypes.DATE,
        allowNull:true
    },
    status:{
        type:DataTypes.STRING
    },
    duration:{
        type:DataTypes.STRING
    }
});

User.hasMany(Attendance,{
    foreignKey:"userId"
});
Attendance.belongsTo(User,{
    foreignKey:"userId"
});

module.exports=Attendance;