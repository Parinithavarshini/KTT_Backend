"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

const sequelize = require("../config/db");

const db = {};    //used to store all models
fs.readdirSync(__dirname)      //read all files in model directory
  .filter(file =>
    file.indexOf(".") !== 0 &&
    file !== "index.js"
  )
  .forEach(file => {

    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );

    db[model.name] = model;
  });

// associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;  //stores everything in db object