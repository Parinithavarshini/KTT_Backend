var models = require('../models');
// var evt = require('../../../lib/event');
var jwt = require('jsonwebtoken');
var config = require('../../../config/security.json');
// var hierarchy = require('../../../lib/helpers/hierarchy');
var moment = require('moment');
var env         = process.env.NODE_ENV || "development";
var app_json = process.env.NODE_ENV_APP_JSON || 'app.json';
// var AppConfig = require('../../../config/' + app_json)[env];
// const logger = require('../../../lib/helpers/rmqlog');
// const redis  = require('../../../lib/helpers/redis');


function buildReplyUser(user) {
    var replyUser = {};
    replyUser = user.dataValues;
    delete replyUser.password;
    return replyUser;
}

exports.create = function(req, res) {
    if (!res.locals.AccountId || !req.body.username || !req.body.password) {
        return res.send({success: false, error: 'fields left empty'});
    } else if (req.body.password.length < 5) {
        return res.send({success: false, error: 'password too short'});
    } else if (req.body.username.length < 2) {
        return res.send({success: false, error: 'username too short'});
    } else if (/[^a-zA-Z0-9\.\@]/.test(req.body.username)) {
        return res.send({success: false, error: 'username must contain only letters, numbers and dots'});
    } else if (isNaN(req.body.role)) {
        return res.send({success: false, error: 'Invalid user role'});
    } else {
        models.Account.find({
            include:[{
                attributes: ['id', 'name'],
                model: models.UserRole
            }],
            where: {
                id: res.locals.AccountId
            }
        }).then(function(account) {
            if (!account) {
                return res.send({success: false, error: 'account not found'});
            }
            let newUserRole = account.UserRoles.find(x=>x.id == req.body.role);
            let currUserRole = account.UserRoles.find(x=>x.id == res.locals.UserRoleId);
            if (newUserRole && newUserRole.name == 'Admin' && currUserRole && currUserRole.name != 'Admin') {
                return res.send({success: false, error: 'Only admins can create this role'});
            }
            models.User.find({
                where: {
                    username: {ilike: req.body.username}
                }
            }).then(function(user) {
                if (user) {
                    return res.send({success: false, error: 'username already taken'});
                }
                models.User.hash(req.body.password, function(err, hash) {
                    var data = {username: req.body.username, password: hash};
                    var hierarchyData = {
                        id: req.body.primaryHierarchyIds ? req.body.primaryHierarchyIds : [],
                        AccountId: res.locals.AccountId
                    }
                    hierarchy.fetchHierarchies(hierarchyData, function (response) {
                        var hierarchyIds = response.results.map(x => x.id);
                        hierarchyIds.sort((a, b) => a - b);
                        data.primaryHierarchyIds = req.body.primaryHierarchyIds ? req.body.primaryHierarchyIds : [];
                        data.secondaryHierarchyIds = hierarchyIds;
                        data.UserRoleId = req.body.role;
                        data.email = req.body.email ? req.body.email : null;
                        data.mobile = req.body.mobile ? req.body.mobile : null;
                        data.firstName = req.body.firstName && req.body.firstName || "";
                        data.userCode = req.body.userCode && req.body.userCode || "";
                        data.lastName = req.body.lastName && req.body.lastName || "";
                        data.user = { // Capture created user
                            created: {
                                id: res.locals.id,
                                username: res.locals.username
                            }
                        }
                        var vehicleGroup = null;
                        if (req.body.group && req.body.group != 'Select Group') {
                            vehicleGroup = req.body.group;
                        }
                        // Enforce OTP login from account config.
                        if (account.config && account.config.loginOtp && account.config.loginOtp == true) {
                            data.otp = 1;
                        }
                        models.User.create(data).then(function(user) {
                            user.setGroups(vehicleGroup);
                            user.setAccount(account).then(function() {
                                if (newUserRole && ['AMCS FTE', 'DE FTE', 'XE FTE', 'ARSA', 'AMCC FTE'].includes(newUserRole.name)) {
                                    evt.events.emit('apl-fte-serviceSummary', {
                                        AccountId: account.id,
                                        role: newUserRole.name,
                                        month: moment().format('MM'),
                                        year: moment().format('YYYY')
                                    });
                                }
                                return res.send({success: true, user: buildReplyUser(user)});
                            });
                        }).catch(function (err) {
                            console.log(`api/users/create error:`, err);
                            return res.send({ success: false, message: 'Error creating user.' });
                        });
                    })
                });
            });
        }).catch(err => {
            console.log(`api/users/create error:`, err);
            return res.send({success:false, error:'Error in creating user.'});
        })
    }
};

exports.list = async function (req, res) {
    try {
        const users = await models.User.findAll({
            attributes: ['id', 'username', 'AccountId', 'group', 'role', 'email', 'mobile', 'userCode', 'firstName', 'lastName'],
            where: {
                AccountId: res.locals.AccountId
            }
        });
        res.send({ success: true, results: users });
    } catch (error) {
        console.log('users/list error:', error);
        logger.RaiseLogEvent('users/list', 'error', error, 'Error fetching users list.');
        return res.send({ success: false, error: 'Error fetching user list.' });
    }
};

exports.get = function(req, res) {
    if (isNaN(req.params.id)) {
        return res.send({ success: false, error: 'Invalid parameter'});
    }
    models.User.find({
        include: [
            {
                attributes: ['id', 'name'],
                model: models.Group
            },
            {
                attributes: ['id', 'name'],
                model: models.ZoneGroup
            },
            {
                attributes: ['id', 'name'],
                model: models.UserRole
            }
        ],
        where: {
            AccountId: res.locals.AccountId,
            id: req.params.id
        }
    }).then(function(user) {
        if (!user) {
            res.send({success: true, user: []});
        } else {
            res.send({success: true, user: buildReplyUser(user)});
        }
    });
};

exports.listByAccountId = async function (req, res) {
    try {
        let whereClause = {
            AccountId: res.locals.AccountId
        };
        if (req.query && req.query.userRoleIds && JSON.parse(req.query.userRoleIds).length) {
            whereClause.UserRoleId = JSON.parse(req.query.userRoleIds);
        }

        const userRoleInclude = {
            attributes: ['id', 'name'],
            model: models.UserRole
        }

        let users = await models.User.findAll({
            attributes: ['id', 'username', 'userCode', 'AccountId', 'role', 'group', 'push', 'tripPush', 'accountsPush', 'email', 'mobile',
                'branchIds', 'activeStatus', 'driverGroupIds', 'driverZoneIds', 'primaryHierarchyIds', 'secondaryHierarchyIds',
                'smsNotification', 'emailNotification', 'notificationTypes', 'user', 'createdAt', 'updatedAt', 'accountIds'],
            include: [
                userRoleInclude,
                {
                    attributes: ['id', 'name'],
                    model: models.Group
                },
                {
                    attributes: ['id', 'name'],
                    model: models.ZoneGroup
                }
            ],
            where: whereClause,
            order: '"id" ASC'
        });
        return res.send({ success: true, results: users });
    } catch (error) {
        console.log('users/listByAccountId error', error);
        logger.RaiseLogEvent('users/listByAccountId', 'error', error, 'Error fetching userlist.');
        return res.send({ success: false, error: 'Error fetching userlist.' });
    }
};

function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 40; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.update = async function (req, res) {
    try {
        logger.RaiseLogEvent('users/update', res.locals.AccountId || 'log', req.body, `User update request by ${res.locals.username}`);
        if ((!req.params.id && req.params.id < 0) || (!req.body.password && !req.body.UserRoleId)) {
            return res.send({ success: false, error: 'Missing input parameters.', message: 'Missing input parameters.' });
        }
        if (req.body.username && /[^a-zA-Z0-9\.\@]/.test(req.body.username)) {
            return res.send({ success: false, error: 'username must contain only letters, numbers and dots' });
        }

        let User = await models.User.findOne({
            include: [{
                attributes: ['id'],
                model: models.Group
            },
            {
                attributes: ['id', 'name'],
                model: models.UserRole
            }],
            where: {
                AccountId: res.locals.AccountId,
                id: req.params.id
            }
        });

        let AdminUsers = await models.User.findOne({
            group: ['UserRole.name'],
            attributes: [
                [models.sequelize.fn('COUNT', models.sequelize.col('User.id')), 'userCount']
            ],
            include: [{
                attributes: ['name'],
                model: models.UserRole,
                where: {
                    name: 'Admin',
                }
            }],
            where: {
                AccountId: res.locals.AccountId,
                activeStatus: true
            },
            raw: true
        });

        let UserRole  = await models.UserRole.findOne({
            attributes: ['id', 'name'],
            where: {
                AccountId: res.locals.AccountId,
                id: req.body.UserRoleId
            }
        });

        if (!User) {
            return res.send({ success: false, error: 'User not found', message: 'User not found' });
        }
        if (!req.body.password && !UserRole) {
            return res.send({ success: false, error: 'Role not found', message: 'Role not found' });
        }
        if (!req.body.password && (AdminUsers && AdminUsers.userCount == 1)) { // if last admin user restrict changing user role
            if (UserRole.name != 'Admin' && (User.UserRole && User.UserRole.name == "Admin")) {
                if (User.UserRole.id != req.body.UserRoleId) {
                    let message = 'Cannot change role. Atleast one admin user should be present in the account!';
                    return res.send({ success: false, error: message, message: message });
                }
            }
        }
        if (User.UserRole.name == 'Admin' && req.body.activeStatus == "false" && (!AdminUsers || AdminUsers.userCount < 2)) {
            return res.send({ success: false, error: 'Cannot change active status. Atleast one admin user should be present in the account!' });
        }

        // Capture updated user.
        let userData = JSON.parse(JSON.stringify(User.user || {}));
        userData.updated = {
            id: res.locals.id,
            username: res.locals.username
        }
        User.user = userData;

        if (req.body.password) {
            // Sankari Roadways - Prevent accountsec update (causing token expiry in BASF API)
            if (res.locals.AccountId == 17 && res.locals.id != 6922) {
                return res.send({success: false, error: 'Only Sangeeth can change passwords!'});
            }
            let hash = await models.User.hashAsync(req.body.password);
            User.password = hash;
            await User.save();
            if (User.UserRole && User.UserRole.name == 'Admin') {
                models.redis.set('accountsec:' + User.AccountId, makeid());
            }
            return res.send({ success: true, user: buildReplyUser(User) });
        } else if (req.body.otp) {
            User.otp = req.body.otp;
            if (req.body.mobile) {
                User.mobile = req.body.mobile;
            }
            await User.save();
            models.redis.del('user:' + User.id);
            redis.delUser(User.id);
            return res.send({ success: true, user: buildReplyUser(User) });
        } else {
            var hierarchyData = {
                id: req.body.primaryHierarchyIds ? req.body.primaryHierarchyIds : [],
                AccountId: res.locals.AccountId
            }
            let response = await hierarchy.fetchHierarchiesAsync(hierarchyData);
            var hierarchyIds = response.results.map(x => x.id);
            hierarchyIds.sort((a, b) => a - b);

            if (req.body.username && User.username != req.body.username.replace(/[^a-zA-Z0-9\.\@]/gi, '')) {
                let existingUser = await models.User.findOne({
                    where: {
                        username: { ilike: req.body.username }
                    }
                });
                if (existingUser) {
                    return res.send({ success: false, error: 'username/email already taken' });
                }
                User.username = req.body.username.replace(/[^a-zA-Z0-9\.\@]/gi, '');
            }

            User.UserRoleId = req.body.UserRoleId || null;
            User.push = req.body.push == 'y' && true || false;
            User.smsNotification = req.body.smsNotification == 'y' && true || false;
            User.emailNotification = req.body.emailNotification == 'y' && true || false;
            User.tripPush = req.body.tripPush == 'y' && true || false;
            User.accountsPush = req.body.accountsPush == 'y' && true || false;
            User.servicePush = req.body.servicePush == 'y' && true || false;
            User.tyrePush = req.body.tyrePush == 'y' && true || false;
            User.documentPush = req.body.documentPush == 'y' && true || false;
            User.activeStatus = req.body.activeStatus == "false" ? false : true;

            if (req.body.zonegroups) {
                await User.setZoneGroups(req.body.zonegroups);
            } else {
                await User.setZoneGroups(null);
            }
            User.email = req.body.email || null;
            User.mobile = req.body.mobile || null;
            User.branchIds = req.body.branchIds || [];
            User.driverZoneIds = req.body.driverZoneIds || [];
            User.driverGroupIds = req.body.driverGroupIds || [];
            User.primaryHierarchyIds = req.body.primaryHierarchyIds || [];
            User.secondaryHierarchyIds = hierarchyIds;
            User.notificationTypes = req.body.notificationTypes || [];
            User.firstName = req.body.firstName || "";
            User.lastName = req.body.lastName || "";
            User.userCode = req.body.userCode || "";
            await User.save();

            var vehicleGroup = null;
            if (req.body.group && req.body.group != 'Select Group') {
                vehicleGroup = req.body.group;
            }
            models.redis.HDEL("ug" + User.id, "assetIds");
            redis.delUser(User.id);
            await User.setGroups(vehicleGroup);

            let updatedUser = await models.User.findOne({
                include: [
                    {
                        attributes: ['id', 'name'],
                        model: models.Group,
                        include: [
                            {
                                attributes: ['id'],
                                model: models.Asset
                            }
                        ]
                    },
                    {
                        attributes: ['id', 'name'],
                        model: models.UserRole
                    }
                ],
                where: { id: User.id }
            });

            evt.events.emit('new-user', buildReplyUser(updatedUser));
            if (updatedUser.Groups && updatedUser.Groups.length) {
                let AssetIds = [...new Set(updatedUser.Groups.flatMap(group => group.Assets.map(x => x.id)))];

                let Assets = await models.Asset.findAll({
                    attributes: {
                        exclude: ['lastDeviceAttribute']
                    },
                    include: [{
                        attributes: ['id', 'name'],
                        model: models.Group,
                        where: {
                            activeStatus: true
                        }
                    }],
                    where:{
                        id: AssetIds,
                        active: true,
                        remove: false,
                        AccountId: res.locals.AccountId
                    }
                });
                
                for (const Asset of JSON.parse(JSON.stringify(Assets))) {
                    evt.events.emit('asset-meta-update', Asset);
                }
            }
            models.redis.del('user:' + User.id);
            return res.send({ success: true, user: buildReplyUser(User) });
        }
    } catch (error) {
        console.log('users/update error: ' + error);
        logger.RaiseLogEvent('users/update', 'error', error, `Error: ${error}`);
        return res.send({ success: false, message: 'Error fetching user data.' });
    }
};

exports.delete = function (req, res) {
    logger.RaiseLogEvent('users/delete', res.locals.AccountId || 'log', {user:res.locals.username, id:req.params.id, AccountId: res.locals.AccountId}, `User delete request by ${res.locals.username}`);
    Promise.all([
        models.User.find({
            include: [
            {
                attributes: ['id', 'name'],
                model: models.UserRole
            }],
            where: {
                id: req.params.id,
                AccountId: res.locals.AccountId
            }
        }),
        models.User.find({
            group: ['UserRole.name'],
            attributes: [
                [models.sequelize.fn('COUNT', models.sequelize.col('User.id')), 'userCount']
            ],
            include: [{
                attributes: ['name'],
                model: models.UserRole,
                where: {
                    name: 'Admin',
                }
            }],
            where: {
                AccountId: res.locals.AccountId,
            },
            raw: true
        })
    ]).then(([user, adminUsers]) => {
        if (!user) {
            return res.send({ success: false, error: 'User not found' });
        }
        if (adminUsers && adminUsers.userCount == 1) { // if last admin user restrict changing user role
            if (user.UserRole.name == 'Admin') {
                let message = 'Cannot delete user. Atleast one admin user should be present in the account!';
                return res.send({ success: false, error: message, message: message  });
            }
        }
        user.destroy()
            .then(function (u) {
                models.redis.del("ug" + req.params.id);
                models.redis.del('user:' + user.id);
                redis.delUser(user.id);
                return res.send({ success: true, error: 'User successfully deleted.' });
            }).catch(function (err) {
                console.log(`Error in users/delete api: ${err} ${err.stack}`);
                return res.send({ success: false, reload: false, results: err.message });
            });
    }).catch(function (err) {
        console.log('users/delete error: ' + err + err.stack);
        return res.send({ success: false, message: 'Error fetching user data.' });
    });
};