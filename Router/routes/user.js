'use strict';

var express = require('express');
var router = express.Router();
var models = require('../models');
var jwt = require('jsonwebtoken');

function requireAdminLogin(req, res, next) {
    const token = req.get('X-AT-SessionToken');
    if (!token) {
        return res.status(403).send({
            success: false,
            error: "Token Missing"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        res.locals.AccountId = decoded.AccountId;
        res.locals.id = decoded.id;
        res.locals.username = decoded.username;
        res.locals.UserRoleId = decoded.UserRoleId;
        next();
    } catch (err) {
        return res.status(403).send({
            success: false,
            error: "Invalid Token",
            debug: err.message
        });
    }
}

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.send({ success: false, error: "Missing credentials" });
        }
        const user = await models.User.findOne({
            where: { username }
        });
        if (!user) {
            return res.send({ success: false, error: "User not found" });
        }
        const match = await models.User.checkPasswordAsync(password, user.password);
        if (!match) {
            return res.send({ success: false, error: "Invalid password" });
        }
        const token = jwt.sign(
            {
                id: user.id,
                AccountId: user.AccountId,
                username: user.username,
                UserRoleId: user.UserRoleId
            },
            process.env.JWT_SECRET || "secret",
            { expiresIn: '1d' }
        );
        res.send({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                AccountId: user.AccountId
            }
        });
    } catch (err) {
        res.send({
            success: false,
            error: "Login failed",
            debug: err.message
        });
    }
});

router.post('/create', requireAdminLogin, async (req, res) => {

    try {

        const { username, password, role } = req.body;
        if (!username || !password) {
            return res.send({ success: false, error: "Missing fields" });
        }

        if (!role) {
            return res.send({ success: false, error: "Role required" });
        }
        const account = await models.Account.findByPk(res.locals.AccountId);

        if (!account) {
            return res.send({
                success: false,
                error: "account not found",
                debug: "AccountId = " + res.locals.AccountId
            });
        }
        const exists = await models.User.findOne({
            where: { username }
        });
        if (exists) {
            return res.send({ success: false, error: "username already exists" });
        }
        const hash = await models.User.hashAsync(password);
        const user = await models.User.create({
            username,
            password: hash,
            UserRoleId: role,
            AccountId: res.locals.AccountId
        });
        res.send({ success: true, user });

    } catch (err) {
        res.send({
            success: false,
            error: "Create failed",
            debug: err.message
        });
    }
});

router.get('/list', requireAdminLogin, async (req, res) => {
    try {
        const users = await models.User.findAll({
            where: { AccountId: res.locals.AccountId }
        });

        res.send({ success: true, results: users });

    } catch (err) {
        res.send({ success: false, error: err.message });
    }
});

router.get('/:id', requireAdminLogin, async (req, res) => {
    const user = await models.User.findOne({
        where: {
            id: req.params.id,
            AccountId: res.locals.AccountId
        }
    });
    if (!user) {
        return res.send({ success: false, error: "User not found" });
    }
    res.send({ success: true, user });
});


router.put('/:id', requireAdminLogin, async (req, res) => {
    const user = await models.User.findOne({
        where: {
            id: req.params.id,
            AccountId: res.locals.AccountId
        }
    });
    if (!user) {
        return res.send({ success: false, error: "User not found" });
    }
    await user.update({
        email: req.body.email,
        mobile: req.body.mobile,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    res.send({ success: true, user });
});

router.delete('/:id', requireAdminLogin, async (req, res) => {
    const user = await models.User.findOne({
        where: {
            id: req.params.id,
            AccountId: res.locals.AccountId
        }
    });

    if (!user) {
        return res.send({ success: false, error: "User not found" });
    }

    await user.destroy();

    res.send({
        success: true,
        message: "Deleted successfully"
    });
});

module.exports = router;