"use strict";

var bcrypt = require('bcryptjs');
var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
    var UsersGeozones = sequelize.define('UsersGeozones', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        }
    });

    var UsersZoneGroups = sequelize.define("UsersZoneGroups", {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        }
    });

    var UsersGroups = sequelize.define("UsersGroups", {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        }
    });

    var User = sequelize.define("User", {
        username: {
            type: Sequelize.STRING, 
            unique: true
        },
        password: Sequelize.STRING,
        email: {
            type: Sequelize.STRING,
            validate: { isEmail: true }
        },
        mobile: Sequelize.STRING,
        otp: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        group: Sequelize.STRING, //'ug'+id
        role: {
            type: Sequelize.ENUM,
            values: ['1', '2', '3'] //values: ['admin', 'manager', 'viewer'] 
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
        },
        branchIds: {
            type: Sequelize.ARRAY(Sequelize.INTEGER), //[]
            defaultValue: []
        },
        driverGroupIds: {
            type: Sequelize.ARRAY(Sequelize.INTEGER), //[]
            defaultValue: []
        },
        driverZoneIds: {
            type: Sequelize.ARRAY(Sequelize.INTEGER), //[]
            defaultValue: []
        },
        activeStatus: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        primaryHierarchyIds: {
            type: Sequelize.ARRAY(Sequelize.INTEGER), //[]
            defaultValue: []
        },
        secondaryHierarchyIds: {
            type: Sequelize.ARRAY(Sequelize.INTEGER), //[]
            defaultValue: []
        },
        notificationTypes: {
            type:  Sequelize.ARRAY(Sequelize.STRING),
            defaultValue: [] 
        },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        accountIds: {
            type: Sequelize.JSONB, // Multiple Accounts Access
            defaultValue: []
            /*
            [{id: 1, name: 'Account 1'}, {id: 2, name: 'Account 2'}]
            */
        },
        user: {
            type: Sequelize.JSONB,
            defaultValue: {}
            /*
            {
                "created": {
                    "id": 1,
                    "username": "kishore"
                },
                "updated": {
                    "id": 2,
                    "username": "bala"
                }
                }
            */
        },
        userCode: Sequelize.STRING,
        images: {
            type: Sequelize.JSONB,
            defaultValue: {} //{profileImgs: []}
        },
        details: {
            type: Sequelize.JSONB,
            defaultValue: {}
            /*
                {
                    "liveMap": {
                        "preventTimeout": true,
                        "disconnectionIdleTime": 10000 //in milliseconds
                    },
                    "preferences": {
                        UOM: {
                            pressure: "",  bar | kpa | psi
                            temp: ""       celsius | fahrenheit | kelvin
                        },
                        "lang": "" en | de | fr | es,
                        "timezone": "330"
                    },
                    "photo": "",
                    "verificationToken": string | null ,
                }
            */
        }
    }, {
        classMethods: {
            associate: function(models) {
            User.belongsTo(models.Account);
            User.belongsTo(models.UserRole);
            User.hasMany(models.Trip, { as: 'tripCreatedBy', foreignKey: 'UserIdCreatedBy' });
            User.hasMany(models.Trip, { as: 'tripUpdatedBy', foreignKey: 'UserIdUpdatedBy' });
            User.hasMany(models.Trip, { as: 'tripSettlementPaidBy', foreignKey: 'UserIdPaidBy' });
            User.hasMany(models.Geozone, { as: 'GeozoneCreatedBy', foreignKey: 'UserIdCreatedBy' });
            User.hasMany(models.Geozone, { as: 'GeozoneUpdatedBy', foreignKey: 'UserIdUpdatedBy' });
            User.hasMany(models.Route, { as: 'RouteCreatedBy', foreignKey: 'UserIdCreatedBy' });
            User.hasMany(models.Route, { as: 'RouteUpdatedBy', foreignKey: 'UserIdUpdatedBy' });
            User.hasMany(models.Driver, { as: 'DriverCreatedBy', foreignKey: 'UserIdCreatedBy' });
            User.hasMany(models.Driver, { as: 'DriverVerifiedBy', foreignKey: 'UserIdVerifiedBy' });
            User.hasMany(models.Document, { as: 'DocumentVerifiedBy', foreignKey: 'UserIdVerifiedBy' });
            User.hasMany(models.Hierarchy, { as: 'HierarchyCreatedBy', foreignKey: 'UserIdCreatedBy'});
            User.hasMany(models.Hierarchy, { as: 'HierarchyUpdatedBy', foreignKey: 'UserIdUpdatedBy'});
            User.hasMany(models.ServiceLog);
            User.belongsTo(User, { as: 'Manager', foreignKey: 'ManagerId' });
            User.belongsToMany(models.Geozone, {
                through: UsersGeozones
            });
            User.belongsToMany(models.ZoneGroup, {
                through: UsersZoneGroups 
            }); 
            User.belongsToMany(models.Group, {
                through: UsersGroups	
            }); 
            },
            hash: function(password, callback) {
                bcrypt.genSalt(11, function (err, salt) {
                    if (err){
                    callback(err, null);
                    } else {
                    bcrypt.hash(password, salt, function(err, hash) {
                        if (err){
                        callback(err, null);
                        } else {
                        callback(null, hash.toString('hex'));
                        }
                    });
                    }
                });
            },
            hashAsync: async (password) => {
                try {
                    const salt = await bcrypt.genSalt(11);
                    const hash = await bcrypt.hash(password, salt);
                    return hash.toString('hex');
                } catch (err) {
                    return err;
                }
            },
            checkPassword: function(password, hash, callback) {
                bcrypt.compare(password, hash, function (err, matched) {
                    callback(err, matched);
                });
            },
            checkPasswordAsync: (password, hash) => {
                return bcrypt.compare(password, hash);
            }
        }
    });

    return User;
};