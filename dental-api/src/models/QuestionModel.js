var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
var QuestionSchema = mongoose.Schema({
    question: {
        type: String,
        default: ""
    },
    explaination: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ["text", "image"],
        default: "text"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        default: null
    },
    answers: [{
        is_correct: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ""
        },
        type: {
            type: String,
            enum: ["text", "image"],
            default: "text"
        }
    }],
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
module.exports = mongoose.model('questions', QuestionSchema);