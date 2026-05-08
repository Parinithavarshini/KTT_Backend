const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");

const User=sequelize.define("User",{
  username:DataTypes.STRING,
  password:DataTypes.STRING,
  district:DataTypes.STRING,
  email:DataTypes.STRING,
  mobile:DataTypes.STRING,
  role:DataTypes.STRING,
  branch:DataTypes.STRING,
  status:DataTypes.STRING,
});
module.exports=User;