const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");
const Student=require("./student");
const Data=sequelize.define("Data",{
    bio:{
        type:DataTypes.STRING
    },
    phone:{
        type:DataTypes.STRING
    }
});
Student.hasOne(Data);
Data.belongsTo(Student);
module.exports=Data;