const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");
const Student=require("./student");
const Course=sequelize.define("Course",{
    coursename:{
        type:DataTypes.STRING
    },
    duration:{
        type:DataTypes.INTEGER
    }
});

Student.hasMany(Course);
Course.belongsTo(Student);
module.exports=Course;