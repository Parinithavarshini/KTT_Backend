const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");
const data=sequelize.define("Data",{
    bio:{
        type:DataTypes.STRING
    },
    phone:{
        type:DataTypes.STRING
    }
});
module.exports=data;