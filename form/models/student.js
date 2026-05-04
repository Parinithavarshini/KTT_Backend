const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");
const Student = sequelize.define("Student",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        unique:true
    },
    age:{
        type:DataTypes.INTEGER
    }
});
module.exports=Student;

//Constraints - allowNull,unique,primary key