const {DataTypes}=require("sequelize");
const sequelize=require("../config/db.js");

const User=sequelize.define("User",{
    name:{
        type:DataTypes.STRING
    },
    password:{
        type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING,
        unique:true
    },
    phone:{
        type:DataTypes.STRING
    }
});

module.exports=User;