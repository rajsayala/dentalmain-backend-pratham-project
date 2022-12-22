var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), process.env.TZ);

var UserSchema = mongoose.Schema({
    first_name: {
        type: String,
        default: ''
    },
    last_name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
        default: ''
    },
    access_token: {
        type: String,
        default: ''
    },
    logged_in_device: {
        type: String,
        default: ''
    },
    user_type: {
        type: String,
        default: 'admin'
    },
    created_date: {
        type: Date,
        default: dateKolkata
    },
    updated_date: {
        type: Date,
        default: dateKolkata
    },
    profile_image: {
        type: String,
        default: ""
    },
    active: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('users', UserSchema);