const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");
const Student=sequelize.define("Student",{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    age:{
        type:DataTypes.STRING,
        allowNull:false,
    },

    course:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    city:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    gender:{
        type:DataTypes.STRING,
        allowNull:false,
    },
});
module.exports=Student;