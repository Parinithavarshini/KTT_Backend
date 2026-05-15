'use strict';

var express = require('express');
var controller = require('../controllers/user');
var router = express.Router();
var models = require('../models');
var jwt = require("jsonwebtoken");
var config = require('../../../config/security.json');

function getSessionSecret(req, callback) {
    var decoded = jwt.decode(req.get('X-AT-SessionToken'), {complete: true});
    var accountId = -1;
    if (decoded != null) {
        accountId = decoded.payload.AccountId
    }
    models.redis.get("accountsec:"+accountId, function(err, secret) {
        if (secret == null) {
            secret = config.session.secret;
        }
        callback(secret);
    })
}

function requireAdminLogin(req, res, next) {
    getSessionSecret(req, function(secret) {
        jwt.verify(req.get('X-AT-SessionToken'), secret, function(err, decoded) {
            if (err) {
                res.status(403);
                res.send({success: false, error: 'Not Authorized'});
            } else {
                res.locals.AccountId = decoded.AccountId;
                res.locals.id = decoded.id;
                res.locals.username = decoded.username;
                res.locals.UserRoleId = decoded.UserRoleId;
                res.locals.role = decoded.UserRole && decoded.UserRole.name || '';
                next();
            }
        });
    });
}

router.post('/isSessionValid', function(req, res, next) {
    getSessionSecret(req, function(secret) {
        jwt.verify(req.get('X-AT-SessionToken'), secret, function(err, decoded) {
            if (err) {
                res.send(false);
            } else {
                var useragent = req.headers['user-agent'] === undefined ? '' : req.headers['user-agent'];
                if ( useragent != '') {
                    var version = parseFloat(useragent.split(/[ /]+/)[2]);
                    var hkey = 'ACC:'+decoded.AccountId+':USER:'+decoded.id;
                    models.redis.hset('app:'+version, hkey, useragent);
                }
                res.send(true);
            }
        });
    });
});

// Routes
router.post('/create', requireAdminLogin, controller.create);
router.get('/list', requireAdminLogin, controller.list);
router.get('/listByAccountId', requireAdminLogin, controller.listByAccountId);
router.put('/:id', requireAdminLogin, controller.update);
router.get('/:id', requireAdminLogin, controller.get);
router.delete('/:id', requireAdminLogin, controller.delete);
module.exports = router;