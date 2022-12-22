// Required Libraries
const { validationResult } = require("express-validator");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const multer = require("multer");
const axios = require("axios");
var mongoose = require('mongoose');

var path = require("path");
var fs = require("fs");

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;
moment().format();
moment.suppressDeprecationWarnings = true;

// Required Models
const User = require("../models/UserModel");
const Category = require("../models/CategoryModel");
const Question = require("../models/QuestionModel");
const Answer = require("../models/AnswerModel");
const ForumQuestion = require("../models/ForumQuestionModel");
const ForumReply = require("../models/ForumReplyModel");

const storage = multer.diskStorage({
    destination: "./public/user", //this path shoud match as mentioned in app.js static path
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
});

const maxSize = 20 * 1000 * 1000;

var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
    // photo is the name of file attribute
}).single("upload");

function getRandomFileName() {
    let timestamp = new Date().toISOString().replace(/[-:.]/g,"");  
    let random = ("" + Math.random()).substring(2, 8); 
    let random_number = timestamp+random;  
    return random_number;
}

module.exports = {
    
    // Register user
    sign_up: async function (req, res) {
        upload(req, res, async function (error) {
            if (error) return res.status(200).send({ status: "error", message: "Profile image upload error." })

            if (
                !req.body.firstName || req.body.firstName === "" ||
                !req.body.lastName || req.body.lastName === "" ||
                !req.body.phoneNumber || req.body.phoneNumber === "" ||
                !req.body.password || req.body.password === "" ||
                !req.body.email || req.body.email === ""
            ) return res.status(200).send({ status: "error", message: "All fields are required." })

            try {
                let userMobile = await User.findOne({ mobile: req.body.phoneNumber, deleted : 0 })
                if(userMobile) return res.status(200).send({ status: "error", message: "Mobile number exists." })
    
                let userEmail = await User.findOne({ email: req.body.email, deleted : 0 })
                if(userEmail) return res.status(200).send({ status: "error", message: "Email id exists." })
    
                let profileImage = ""
    
                // console.log('FILES ', req.file)
                if (req.file) {
                    profileImage = req.file.path
                        .replace(/\\/g, "/")
                        .replace("public", process.env.BASE_URL);
                }
                
                bcryptjs.genSalt(saltRounds, (err, salt) => {
                    // Hashing password
                    bcryptjs.hash(req.body.password, salt, (err, hash) => {
                        var otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
                        var userData = new User({
                            first_name: req.body.firstName,
                            last_name: req.body.lastName,
                            email: req.body.email,
                            mobile: req.body.phoneNumber,
                            password: hash,
                            otp: otp,
                            profile_image: profileImage,
                            user_type: "customer",
                            created_date: moment().format(),
                            updated_date: moment().format()
                        });
                        userData.save(function (err, response) {
                            if (err) {
                                res.status(200).send({ status: "error", message: err })
                                if (profileImage != "") {
                                    try {
                                        if (fs.existsSync(profileImage.replace(process.env.BASE_URL, "public"))) {
                                            fs.unlinkSync(profileImage.replace(process.env.BASE_URL, "public"), function (err) {
                                                if (err) console.log(err);
                                            });
                                            console.log("Upload failed. Profile image deleted.");
                                        }
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }
                            } else {
                                res.status(200).send({ status: "success", message: "Account has been created successfully." });
                                // axios
                                //     .get(
                                //         "https://2factor.in/API/V1/5442cbe9-cfbd-11ec-9c12-0200cd936042/SMS/" +
                                //             req.body.mobile +
                                //             "/" +
                                //             otp +
                                //             "/SMSOTP",
                                //         {}
                                //     )
                                //     .then(function (response) {
                                //         res.status(200).send({ status: "success", message: "Account has been created successfully. Verify OTP Sent To Phone." });
                                //     })
                                //     .catch(function (error) {
                                //         res.status(200).send({ status: "success", message: "Account has been created successfully." });
                                //     });
                            }
                        });
                    });
                });
            } catch (e) {
                console.log("SIGN UP CATCH ", e)
                res.status(200).send({ status: "error", message: "Internal server error." })
            }
        });
    },

    // Login user
    sign_in: async function (req, res) {
        try {
            const errors = validationResult(req);
            // Checking fields validation errors
            if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
            
            var where = {};
            where["$or"] = [{ mobile: req.body.username }, { email: req.body.username }];
            where["deleted"] = 0;
    
            let user = await User.findOne(where)
            if(!user) return res.status(200).send({ status: "error", message: "User does not exist." })
            if (user.active == 0) return res.status(200).send({ status: "error", message: "User is blocked or not verified." });
    
            if (user.phone_verify && user.phone_verify != 0) {
                // axios.get(
                //         "https://2factor.in/API/V1/5442cbe9-cfbd-11ec-9c12-0200cd936042/SMS/" +
                //             user.mobile +
                //             "/" +
                //             user.phone_verify +
                //             "/SMSOTP",
                //         {}
                //     )
                //     .then(function (response) {
                //         res.status(200).send({ status: "error", message: "Verify OTP Sent To Phone." });
                //     })
                //     .catch(function (error) {
                //         res.status(200).send({ status: "error", message: "Verify OTP." });
                //     });
                res.status(200).send({ status: "error", message: "Verify OTP." });
                return;
            }
    
            bcryptjs.compare(req.body.password, user.password, async function (err, result) {
                if (result != true) return res.status(200).send({ status: "error", message: "Invalid password" })
                const accessToken = jwt.sign(
                    {
                        _id: user._id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        mobile: user.mobile,
                        email: user.email,
                    },
                    JWT_SECRET,
                    {
                        expiresIn: "31000000s",
                    }
                );

                user.password = null

                res.status(200).send({ status: "success", message: "Logged in", token: accessToken, result: user });
                let updateData = { updated_date: moment().format() }
                if(req.body.access_token && req.body.access_token != "") updateData['access_token'] = req.body.access_token
                if(req.body.logged_in_device && req.body.logged_in_device != "") updateData['logged_in_device'] = req.body.logged_in_device
                await User.findOneAndUpdate({ _id: user._id }, updateData, { new: true })
                return;
            });
        } catch (e) {
            console.log("SIGN IN CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    // Verify OTP
    otp_verification: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            var where = {};
            where["$or"] = [{ mobile: req.body.username }, { email: req.body.username }];
            where["deleted"] = 0;
    
            let user = await User.findOne(where)
            if(!user) return res.status(200).send({ status: "error", message: "User does not exist." })
            if(user.otp != req.body.otp) return res.status(200).send({ status: "error", message: "Invalid OTP." })
    
            user = await User.findOneAndUpdate({ _id: user._id }, { otp: '0', active: 1, updated_date: moment().format() }, { new: true })
    
            const accessToken = jwt.sign(
                {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    mobile: user.mobile,
                    user_type: user.user_type,
                    email: req.body.email,
                },
                JWT_SECRET,
                {
                    expiresIn: "31000000s",
                }
            );
            user.password = null
            res.status(200).send({ status: "success", message: "Phone Verified", token: accessToken, result: user });
        } catch (e) {
            console.log("OTP VERIFY CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    forgot_password: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            var where = {};
            where["$or"] = [{ mobile: req.body.username }, { email: req.body.username }];
            where["deleted"] = 0;
    
            let user = await User.findOne(where)
            if(!user) return res.status(200).send({ status: "error", message: "User does not exist." })
            if (user.active == 0) return res.status(200).send({ status: "error", message: "User is blocked or not verified." });

            let otp = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
            user = await User.findOneAndUpdate({ _id: user._id }, { otp: otp, updated_date: moment().format() }, { new: true })

            // axios
            //     .get(
            //         "https://2factor.in/API/V1/5442cbe9-cfbd-11ec-9c12-0200cd936042/SMS/" +
            //             user.mobile +
            //             "/" +
            //             otp +
            //             "/SMSOTP",
            //         {}
            //     )
            //     .then(function (response) { res.status(200).send({ status: "success", message: "OTP Sent To Phone And Email" }); })
            //     .catch(function (error) { res.status(200).send({ status: "error", message: "Unable to send otp" }) });
            res.status(200).send({ status: "success", message: "OTP Sent To Phone." });
        } catch (e) {
            console.log("FORGOT PASS CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    change_user_password: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            var where = {};
            where["$or"] = [{ mobile: req.body.username }, { email: req.body.username }];
            where["deleted"] = 0;
            let user = await User.findOne(where)
            if(!user) return res.status(200).send({ status: "error", message: "User does not exist." })
            if (user.active == 0) return res.status(200).send({ status: "error", message: "User is blocked or not verified." });

            bcryptjs.compare(req.body.old_password, user.password, function (err, result) {
                if (result == true) {
                    bcryptjs.genSalt(saltRounds, (err, salt) => {
                        // Hashing password
                        bcryptjs.hash(req.body.new_password, salt, (err, hash) => {                            
                            User.findOneAndUpdate(where, { password: hash }, {
                                new: true,
                            })
                                .exec()
                                .then((response) => {
                                    res.status(200).send({
                                        status: "success",
                                        message: "New Password Has Been Set"
                                    });
                                })
                                .catch((error) => {
                                    res.status(200).send({
                                        status: "error",
                                        message: "Something went wrong",
                                    });
                                });
                        });
                    });
                } else {
                    res.status(200).send({
                        status: "error",
                        message: "Invalid password",
                    });
                }
            });
        } catch (e) {
            console.log("CHANGE PASS CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    change_forgotten_password: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            var where = {};
            where["$or"] = [{ mobile: req.body.username }, { email: req.body.username }];
            where["deleted"] = 0;
            let user = await User.findOne(where)
            if(!user) return res.status(200).send({ status: "error", message: "User does not exist." })
            if (user.active == 0) return res.status(200).send({ status: "error", message: "User is blocked or not verified." });
            if (user.otp != 0) return res.status(200).send({ status: "error", message: "OTP not verified." });

            bcryptjs.genSalt(saltRounds, (err, salt) => {
                // Hashing password
                bcryptjs.hash(req.body.password, salt, (err, hash) => {                            
                    User.findOneAndUpdate(where, { password: hash }, {
                        new: true,
                    })
                        .exec()
                        .then((response) => {
                            res.status(200).send({
                                status: "success",
                                message: "New Password Has Been Set"
                            });
                        })
                        .catch((error) => {
                            res.status(200).send({
                                status: "error",
                                message: "Something went wrong",
                            });
                        });
                });
            });
        } catch (e) {
            console.log("FORGOT PASS CHANGE CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    update_user: async function (req, res) {
        upload(req, res, async function (error) {
            if (error) return res.status(200).send({ status: "error", message: "Profile image upload error." })

            try {                
                let user = await User.findOne({ _id: req.token._id })
                if(!user) return res.status(200).send({ status: "error", message: "Cannot find user." })

                let updateData = { updated_date: moment().format() }
                let lastProfileImage = user.profile_image
    
                // console.log('FILES ', req.file)
                if (req.file) {
                    updateData['profile_image'] = req.file.path
                        .replace(/\\/g, "/")
                        .replace("public", process.env.BASE_URL);
                }
                if(req.body.firstName && req.body.firstName != "") updateData['first_name'] = req.body.firstName
                if(req.body.lastName && req.body.lastName != "") updateData['last_name'] = req.body.lastName
                // console.log("UPD ", updateData)
                user = await User.findOneAndUpdate({ _id: user._id }, updateData, { new: true })

                
                user.password = null
                res.status(200).send({ status: "success", message: "Profile updated successfully.", result: user });
                
                if(req.file && lastProfileImage && lastProfileImage != "") {
                    try {
                        if (fs.existsSync(lastProfileImage.replace(process.env.BASE_URL, "public"))) {
                            fs.unlinkSync(lastProfileImage.replace(process.env.BASE_URL, "public"), function (err) {
                                if (err) console.log(err);
                            });
                            console.log("Previous profile image deleted");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            } catch (e) {
                console.log("UPDATE USER CATCH ", e)
                res.status(200).send({ status: "error", message: "Internal server error." })
            }
        });
    },

    category_list: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            var where = { deleted: 0, type: "question" };
            if(req.params.type) where['type'] = "forum"
            let categories = await Category.find(where)
            if(!categories) return res.status(200).send({ status: "error", message: "Could not get categories." })

            res.status(200).send({ status: "success", message: "Category list obtained successfully.", result: categories })
        } catch (e) {
            console.log("CATEGORY LIST CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    question_list: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            var where = { deleted: 0, category: req.body.category_id };
            let questions = await Question.find(where).populate("category", "name file")
            if(!questions) return res.status(200).send({ status: "error", message: "Could not get questions." })

            res.status(200).send({ status: "success", message: "Questions obtained successfully.", result: questions })
        } catch (e) {
            console.log("QUESTION LIST CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    add_answer_result: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            let user = await User.findOne({ deleted: 0, _id: req.token._id })
            if(!user) return res.status(200).send({ status: "error", message: "User does not exist." })

            req.body.user = user._id
            req.body.created_date = moment().format()
            req.body.update_date = moment().format()

            let answerData = new Answer(req.body);

            answerData.save(function (err, savedData) {
                if (err) return res.status(200).send({ status: "error", message: "Unable to save result." })
                res.status(200).send({ status: "success", message: "Test result submitted successfully." });
            })
        } catch (e) {
            console.log("ADD QUESTION RESULT CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    add_forum_question: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            let user = await User.findOne({ deleted: 0, _id: req.token._id })
            if(!user) return res.status(200).send({ status: "error", message: "User does not exist." })

            req.body.user = user._id
            req.body.created_date = moment().format()
            req.body.update_date = moment().format()

            let forumQuestionData = new ForumQuestion(req.body);

            forumQuestionData.save(function (err, savedData) {
                if (err) return res.status(200).send({ status: "error", message: "Unable to save result." })
                res.status(200).send({ status: "success", message: "Forum question added successfully." });
            })
        } catch (e) {
            console.log("ADD FORUM QUESTION CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    add_forum_reply: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            let user = await User.findOne({ deleted: 0, _id: req.token._id })
            if(!user) return res.status(200).send({ status: "error", message: "User does not exist." })

            req.body.user = user._id
            req.body.created_date = moment().format()
            req.body.update_date = moment().format()

            let forumReplyData = new ForumReply(req.body);

            forumReplyData.save(function (err, savedData) {
                if (err) return res.status(200).send({ status: "error", message: "Unable to save result." })
                res.status(200).send({ status: "success", message: "Forum question replied successfully." });
            })
        } catch (e) {
            console.log("ADD FORUM REPLY CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    forum_question_list: async function (req, res) {
        if(req.params.type != "customer" && req.params.type != "category") return res.status(404).send({ status: "error", message: "Invalid api." })
        try {
            let where = {}
            if(req.params.type == "customer") {
                if(req.body.user && req.body.user != "") {
                    where['user'] = req.body.user
                    where['deleted'] = 0
                    where['active'] = 1
                } else where['user'] = req.token._id
            }
            if(req.params.type == "category") {
                if(!req.body.category || req.body.category == "") return res.status(404).send({ status: "error", message: "Category id required." })
                where['category'] = req.body.category
                where['deleted'] = 0
                where['active'] = 1
            }

            let questions = await ForumQuestion.find(where).populate("category", "name file").populate("user", "first_name last_name email mobile profile_image")
            if(!questions) return res.status(200).send({ status: "error", message: "Could not get questions." })

            res.status(200).send({ status: "success", message: "Forum questions obtained successfully.", result: questions })
        } catch (e) {
            console.log("FORUM Qn LIST CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    forum_reply_list: async function (req, res) {
        if(req.params.type != "customer" && req.params.type != "category" && req.params.type != "question") return res.status(404).send({ status: "error", message: "Invalid api." })
        try {
            let where = {}
            if(req.params.type == "customer") {
                if(req.body.user && req.body.user != "") {
                    where['user'] = req.body.user
                    where['deleted'] = 0
                    where['active'] = 1
                } else where['user'] = req.token._id
            }
            if(req.params.type == "category") {
                if(!req.body.category || req.body.category == "") return res.status(404).send({ status: "error", message: "Category id required." })
                where['category'] = req.body.category
                where['deleted'] = 0
                where['active'] = 1
            }
            if(req.params.type == "question") {
                if(!req.body.question || req.body.question == "") return res.status(404).send({ status: "error", message: "Question id required." })
                where['question'] = req.body.question
                where['deleted'] = 0
                where['active'] = 1
            }

            let questions = await ForumReply.find(where).populate("category", "name file").populate("user", "first_name last_name email mobile profile_image")
            if(!questions) return res.status(200).send({ status: "error", message: "Could not get replies." })

            res.status(200).send({ status: "success", message: "Forum replies obtained successfully.", result: questions })
        } catch (e) {
            console.log("FORUM Qn LIST CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    delete_forum_question: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            await ForumQuestion.findOneAndUpdate({ _id: req.body.question, user: req.token._id }, { deleted: 1, updated_date: moment().format() }, { new: true })

            res.status(200).send({ status: "success", message: "Forum question deleted successfully." });
        } catch (e) {
            console.log("FORGOT PASS CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },

    delete_forum_reply: async function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) return res.status(200).send({ status: "validation_error", errors: errors.array() });
        
        try {
            await ForumReply.findOneAndUpdate({ _id: req.body.question, user: req.token._id }, { deleted: 1, updated_date: moment().format() }, { new: true })

            res.status(200).send({ status: "success", message: "Forum reply deleted successfully." });
        } catch (e) {
            console.log("FORGOT PASS CATCH ", e)
            res.status(200).send({ status: "error", message: "Internal server error." })
        }
    },
};
