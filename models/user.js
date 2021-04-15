const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email : {
        type: String,
        required: true,
        unique: true
    }
})

//Add on to our Schema a username and password and make sure the username is unique
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);