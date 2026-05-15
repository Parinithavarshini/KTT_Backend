"use strict";

var Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
    var Account = sequelize.define("Account", {
        name: { type: Sequelize.STRING, unique: true },
        type: Sequelize.INTEGER,
        status: Sequelize.INTEGER,
        tname: Sequelize.STRING,
        oname: Sequelize.STRING,
        phone1: Sequelize.STRING,
        email1: Sequelize.STRING,
        phone2: Sequelize.STRING,
        email2: Sequelize.STRING,
        phone3: Sequelize.STRING,
        phone4: Sequelize.STRING,
        route: Sequelize.STRING,
        note: Sequelize.STRING,
        anote: Sequelize.TEXT,
        csnote: Sequelize.TEXT,
        totalvehicle: Sequelize.STRING,
        city: Sequelize.STRING,
        language: Sequelize.STRING,
        baddress: Sequelize.STRING,
        saddress: Sequelize.STRING,
        gst: Sequelize.STRING,
        devicebalance: Sequelize.STRING,
        rechargebalance: Sequelize.STRING,
        tag: Sequelize.STRING,
        fastag: { type: Sequelize.JSONB, defaultValue: {} },
        fastagBalance: { type: Sequelize.JSONB, defaultValue: {} },
        config: { type: Sequelize.JSONB, defaultValue: {} },
        driverConfig: { type: Sequelize.JSONB, defaultValue: {} },
        tripConfig: { type: Sequelize.JSONB, defaultValue: { simpleSettlement: true } },
        serviceConfig: { type: Sequelize.JSONB, defaultValue: {} },
        driverMsg: { type: Sequelize.JSON, defaultValue: {} },
        lastPoNo: Sequelize.STRING,
        lastGrnNo: Sequelize.STRING,
        lastTripSheetNo: Sequelize.STRING,
        lastDriverTripSheetNo: Sequelize.INTEGER,
        lastTripRefNo: Sequelize.STRING,
        lastJobCardNo: Sequelize.STRING,
        lastLrNo: Sequelize.STRING,
        loadBoard: Sequelize.INTEGER,
        paymentStatus: { type: Sequelize.INTEGER, defaultValue: 0 },
        details: { type: Sequelize.JSONB, defaultValue: {} }
    });

    Account.associate = function (models) {
        Account.hasMany(models.UserRole);
        Account.hasMany(models.User);
    };

    return Account;
};
