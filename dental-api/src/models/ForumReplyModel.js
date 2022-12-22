var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
var ForumReplySchema = mongoose.Schema({
    answers: {
        type: String,
        default: ""
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        default: null
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'forum_questions',
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    active: {
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
    update_date: {
        type: Date, default: dateKolkata
    }
});
module.exports = mongoose.model('forum_replies', ForumReplySchema);