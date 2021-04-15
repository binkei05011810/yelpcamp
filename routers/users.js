const express = require('express');
const userRouter = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const users = require('../controllers/users')

userRouter.route('/register')
    .get(users.renderRegister)
    .post(users.register)

userRouter.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

userRouter.get('/logout', users.logout);

module.exports = userRouter;