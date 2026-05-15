"use strict";

var bcrypt = require('bcryptjs');
var Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {

    var User = sequelize.define("User", {
        username: { type: Sequelize.STRING, unique: true },
        password: Sequelize.STRING,
        email: { type: Sequelize.STRING, validate: { isEmail: true } },
        mobile: Sequelize.STRING,
        otp: { type: Sequelize.INTEGER, defaultValue: 0 },
        group: Sequelize.STRING,
        role: { type: Sequelize.ENUM, values: ['1', '2', '3'] },
        menu: { type: Sequelize.JSON, defaultValue: {} },
        push: { type: Sequelize.BOOLEAN, defaultValue: true },
        smsNotification: { type: Sequelize.BOOLEAN, defaultValue: false },
        emailNotification: { type: Sequelize.BOOLEAN, defaultValue: false },
        tripPush: { type: Sequelize.BOOLEAN, defaultValue: true },
        accountsPush: { type: Sequelize.BOOLEAN, defaultValue: false },
        tyrePush: { type: Sequelize.BOOLEAN, defaultValue: false },
        servicePush: { type: Sequelize.BOOLEAN, defaultValue: false },
        documentPush: { type: Sequelize.BOOLEAN, defaultValue: false },
        branchIds: { type: Sequelize.ARRAY(Sequelize.INTEGER), defaultValue: [] },
        driverGroupIds: { type: Sequelize.ARRAY(Sequelize.INTEGER), defaultValue: [] },
        driverZoneIds: { type: Sequelize.ARRAY(Sequelize.INTEGER), defaultValue: [] },
        activeStatus: { type: Sequelize.BOOLEAN, defaultValue: true },
        primaryHierarchyIds: { type: Sequelize.ARRAY(Sequelize.INTEGER), defaultValue: [] },
        secondaryHierarchyIds: { type: Sequelize.ARRAY(Sequelize.INTEGER), defaultValue: [] },
        notificationTypes: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        accountIds: { type: Sequelize.JSONB, defaultValue: [] },
        user: { type: Sequelize.JSONB, defaultValue: {} },
        userCode: Sequelize.STRING,
        images: { type: Sequelize.JSONB, defaultValue: {} },
        details: { type: Sequelize.JSONB, defaultValue: {} }
    });
    User.associate = function (models) {
        User.belongsTo(models.Account);
        User.belongsTo(models.UserRole);
    };

    User.hash = function (password, callback) {
        bcrypt.genSalt(11, function (err, salt) {
            if (err) {
                callback(err, null);
            } else {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, hash.toString('hex'));
                    }
                });
            }
        });
    };

    User.hashAsync = async function (password) {
        try {
            const salt = await bcrypt.genSalt(11);
            const hash = await bcrypt.hash(password, salt);
            return hash.toString('hex');
        } catch (err) {
            return err;
        }
    };

    User.checkPassword = function (password, hash, callback) {
        bcrypt.compare(password, hash, function (err, matched) {
            callback(err, matched);
        });
    };

    User.checkPasswordAsync = function (password, hash) {
        return bcrypt.compare(password, hash);
    };

    return User;
};
