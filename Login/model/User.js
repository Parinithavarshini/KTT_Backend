const {DataTypes}=require("sequelize");
const sequelize=require("../config/db.js");

const User=sequelize.define("c",{
    name:{
        type:DataTypes.STRING
    },
    password:{
        type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING,
        unique:{
            name:"email_unique_idx"
        }
    },
    phone:{
        type:DataTypes.STRING
    },
    resetOTP:{
        type:DataTypes.STRING,
        allowNull:true
    },
    otpExpiry:{
        type:DataTypes.DATE,
        allowNull:true
    }
});

module.exports=User;