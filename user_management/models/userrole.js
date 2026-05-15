"use strict";

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
    var UserRole = sequelize.define("UserRole", {
        id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        menu: {
            type: Sequelize.JSON,
            defaultValue: {}
        },
        push: { 
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        smsNotification: { 
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        emailNotification: { 
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        tripPush: { 
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        accountsPush: {
            type:Sequelize.BOOLEAN,
            defaultValue: false
        },
        tyrePush: {
            type:Sequelize.BOOLEAN,
            defaultValue: false
        },
        servicePush: {
            type:Sequelize.BOOLEAN,
            defaultValue: false
        },
        documentPush: {
            type:Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                UserRole.belongsTo(models.Account);
                UserRole.hasMany(models.User);
            }
        },
        indexes: [{
            unique: true,
            fields: ['name', 'AccountId']
        }]
    });
    return UserRole;
};