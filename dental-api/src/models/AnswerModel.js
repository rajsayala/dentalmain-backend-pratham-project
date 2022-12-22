var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
var AnswerSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        default: null
    },
    total_marks: {
        type: Number,
        default: 0
    },
    obtained_marks: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Number,
        default: 0
    },
    created_date: {
        type: Date, default: dateKolkata
    },
});
module.exports = mongoose.model('answers', AnswerSchema);