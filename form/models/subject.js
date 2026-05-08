const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");
const Subject=sequelize.define("Subject",{
   subjectname:{
      type:DataTypes.STRING
   }
});
module.exports=Subject;