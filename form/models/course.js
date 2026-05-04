const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");
const Course=sequelize.define("Course",{
    coursename:{
        type:DataTypes.STRING
    },
    duration:{
        type:DataTypes.INTEGER
    }
});
module.exports=Course;