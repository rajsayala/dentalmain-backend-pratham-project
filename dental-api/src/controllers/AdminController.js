// Required Libraries
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const moment = require("moment");
const multer = require("multer");
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

// Upload Functions
const storage = multer.diskStorage({
    destination: "./public", //this path shoud match as mentioned in app.js static path
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
    dashboard: async function (req, res) {
        try {
            let customer = await User.find({ user_type: 'customer', deleted: 0 }).countDocuments()
            let category = await Category.find({ type: 'question', deleted: 0 }).countDocuments()
            let forum = await Category.find({ type: 'forum', deleted: 0 }).countDocuments()
            let forumQuestions = await ForumQuestion.find({ deleted: 0 }).countDocuments()
            let forumReplies = await ForumReply.find({ deleted: 0 }).countDocuments()
            let unapprovedForumQuestions = await ForumQuestion.find({ deleted: 0, active: 0 }).countDocuments()
            let unapprovedForumReplies = await ForumReply.find({ deleted: 0, active: 0 }).countDocuments()

            res.status(200).send({
                status: "success",
                customer,
                category, 
                forum,
                forumQuestions,
                forumReplies,
                unapprovedForumQuestions,
                unapprovedForumReplies
            });
        } catch (e) {
            console.log(e);
            res.status(200).send({ status: "error", message: "Unable to get analytics." });
        }
    },

    // User login
    login: function (req, res) {
        const errors = validationResult(req);
        // Checking fields validation errors
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({ status: "validation_error", errors: errors.array() });
        } else {
            console.log(req.body.email);
            var where = {};
            where["email"] = req.body.email;
            where["user_type"] = "admin";
            // Getting user according to email
            User.findOne(where)
                .then((user) => {
                    if (user == null) return res.status(200).send({ status: "error", message: "User not found" });
                    if (user.active == 0) return res.status(200).send({ status: "error", message: "Account is inactive" });

                    // Validating password
                    bcryptjs.compare(req.body.password, user.password, function (err, result) {
                        if (result != true) return res.status(200).send({ status: "error", message: "Invalid password" });
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
                        res.status(200).send({
                            status: "success",
                            message: "Logged in",
                            token: accessToken,
                            result: user,
                        });
                    });
                })
                .catch((error) => {
                    console.log(error);
                    res.status(200).send({ status: "error", message: "Invalid email" });
                });
        }
    },

    // Create User
    create_admin: function (req, res) {
        var where = {};
        where["mobile"] = req.body.mobile;
        // Checking user mobile number
        User.findOne(where)
            .then((response) => {
                if (response != null) {
                    res.status(200).send({
                        status: "error",
                        message: "Mobile already in use.",
                    });
                } else {
                    var where = {};
                    where["email"] = req.body.email;
                    // Checking user email
                    User.findOne(where)
                        .then((response) => {
                            if (response != null) {
                                res.status(200).send({
                                    status: "error",
                                    message: "Email address already in use.",
                                });
                            } else {
                                // // Generating password salt
                                bcryptjs.genSalt(saltRounds, (err, salt) => {
                                    // Hashing password
                                    bcryptjs.hash(req.body.password, salt, (err, hash) => {
                                        var userData = new User({
                                            first_name: req.body.first_name,
                                            email: req.body.email,
                                            mobile: req.body.mobile,
                                            active: 1,
                                            password: hash,
                                            created_date: moment().format(),
                                        });

                                        userData.save(function (err, savedUser) {
                                            if (err) {
                                                res.status(200).send({
                                                    status: "error",
                                                    message: err,
                                                    token: req.token,
                                                });
                                            } else {
                                                res.status(200).send({
                                                    status: "success",
                                                    message: "Account has been created successfully.",
                                                    data: savedUser,
                                                });
                                            }
                                        });
                                    });
                                });
                            }
                        })
                        .catch((error) => {
                            res.status(200).send({
                                status: "error",
                                message: "Invalid email",
                            });
                        });
                }
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid mobile",
                });
            });
    },

    // Change admin password
    change_password: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;

        var updateData = {};
        updateData["updated_date"] = moment().format();

        bcryptjs.genSalt(saltRounds, (err, salt) => {
            bcryptjs.hash(req.body.password, salt, (err, hash) => {
                if (req.body.password != "") updateData["password"] = hash

                User.findOneAndUpdate(where, updateData, {
                    new: true,
                })
                    .exec()
                    .then((response) => {
                        res.status(200).send({
                            status: "success",
                            message: "Password updated successfully",
                            token: req.token,
                        });
                    })
                    .catch((error) => {
                        res.status(200).send({
                            status: "error",
                            message: "Something went wrong",
                            token: req.token,
                        });
                    });
            });
        });
    },

    /// Start Category ///

    add_category: function (req, res) {
        upload(req, res, function (error) {
            if (error) {
                var where = {};
                where["name"] = req.body.name;
                where["deleted"] = 0;
                Category.findOne(where).then((response) => {
                    if (response != null) {
                        res.status(200).send({
                            status: "error",
                            message: "Category exist in the database.",
                        });
                    } else {
                        var categoryData = new Category({
                            name: req.body.name,
                            type: req.body.type,
                            parent: req.body.parent == "" ? null : req.body.parent,
                            created_date: moment().format(),
                        });
                        categoryData.save(function (err, response) {
                            if (err) {
                                res.status(200).send({ status: "error", message: err });
                            } else {
                                res.status(200).send({ status: "success", message: "Category has been created successfully." });
                            }
                        });
                    }
                });
            } else {
                var where = {};
                where["name"] = req.body.name;
                where["deleted"] = 0;
                Category.findOne(where).then((response) => {
                    if (response != null) {
                        res.status(200).send({
                            status: "error",
                            message: "Category exist in the database.",
                        });
                    } else {
                        var categoryData = new Category({
                            name: req.body.name,
                            type: req.body.type,
                            parent: req.body.parent == "" ? null : req.body.parent,
                            file: req.file.path.replace(/\\/g, "/").replace("public", process.env.BASE_URL),
                        });
                        categoryData.save(function (err, response) {
                            if (err) {
                                res.status(200).send({ status: "error", message: err });
                            } else {
                                res.status(200).send({ status: "success", message: "Category has been created successfully." });
                            }
                        });
                    }
                });
            }
        });
    },

    main_category_list: function (req, res) {
        var where = {};
        where["parent"] = null;
        if(!req.body.type) where["active"] = 1;
        where["deleted"] = 0;
        Category.find(where)
            .sort({
                name: 1,
            })
            .then((response) => {
                Category.find(where).countDocuments(function (err, count) {
                    res.status(200).send({
                        status: "success",
                        result: response,
                        totalCount: count,
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    token: req.token,
                });
            });
    },

    parent_category_list: function (req, res) {
        var where = {};
        where["parent"] = req.body.parent;
        if(!req.body.type) where["active"] = 1;
        where["deleted"] = 0;
        // console.log("PROD ",where)
        Category.find(where)
            .sort({
                name: 1,
            })
            .then((response) => {
                Category.find(where).countDocuments(function (err, count) {
                    res.status(200).send({
                        status: "success",
                        result: response,
                        totalCount: count,
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    token: req.token,
                });
            });
    },

    category_list: function (req, res) {
        const errors = validationResult(req);
        if (Object.keys(errors.array()).length > 0) {
            res.status(200).send({
                status: "validation_error",
                errors: errors.array(),
                token: req.token,
            });
        } else {
            var where = {};

            if (req.body.name != "") {
                where["name"] = {
                    $regex: ".*" + req.body.name,
                    $options: "i",
                };
            }

            if (req.body.active != "") {
                where["active"] = req.body.active;
            }

            if (req.body.parent != "") {
                where["parent"] = req.body.parent;
            }

            where["deleted"] = 0;

            Category.find(where, null, {
                limit: parseInt(req.body.limit),
                skip: parseInt(req.body.page),
            })
                .populate("parent", "name")
                .sort({
                    name: 1,
                })
                .then((response) => {
                    Category.find(where).countDocuments(function (err, count) {
                        res.status(200).send({
                            status: "success",
                            token: req.token,
                            result: response,
                            totalCount: count,
                        });
                    });
                })
                .catch((error) => {
                    res.status(200).send({
                        status: "error",
                        message: error,
                        token: req.token,
                    });
                });
        }
    },

    category_list_test: function (req, res) {
        var where = {};

        if (req.body.name && req.body.name != "") {
            where["name"] = {
                $regex: ".*" + req.body.name,
                $options: "i",
            };
        }

        if (req.body.active && req.body.active != "") {
            where["active"] = req.body.active;
        }

        if (req.body.parent && req.body.parent != "") {
            // where["parent"] = req.body.parent;
            where["$or"] = [{ parent: req.body.parent }, { _id: req.body.parent }];
        }

        where['type'] = req.body.type

        where["deleted"] = 0;

        Category.find(where, null, {
            limit: parseInt(req.body.limit),
            skip: parseInt(req.body.page),
        })
            .populate("parent", "name")
            .populate({
                path: "parent",
                populate: [
                    {
                        path: "parent",
                        select: "name",
                    },
                ],
            })
            .sort({
                name: 1,
            })
            .then((response) => {
                // console.log("CATL",response.length)
                Category.find(where).countDocuments(function (err, count) {
                    // console.log("CATC",count)
                    res.status(200).send({
                        status: "success",
                        token: req.token,
                        result: response,
                        totalCount: count,
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: error,
                    token: req.token,
                });
            });
    },

    update_category_status: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;
        Category.findOneAndUpdate(
            where,
            {
                active: req.body.status,
            },
            {
                new: true,
            }
        )
            .exec()
            .then((response) => {
                res.status(200).send({
                    status: "success",
                    message: "Status updated",
                    token: req.token,
                    active: req.body.status,
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: "Something went wrong",
                    token: req.token,
                });
            });
    },

    get_category: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;
        Category.findOne(where)
        .populate('parent','parent')
            .then((response) => {
                res.status(200).send({
                    status: "success",
                    token: req.token,
                    result: response,
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: "Invalid category id",
                    token: req.token,
                });
            });
    },

    delete_category: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;
        Category.findOneAndUpdate(
            where,
            {
                deleted: 1,
            },
            {
                new: true,
            }
        )
            .exec()
            .then((response) => {
                res.status(200).send({
                    status: "success",
                    message: "Category has been deleted",
                    token: req.token,
                });
            })
            .catch((error) => {
                res.status(200).send({
                    status: "error",
                    message: "Something went wrong",
                    token: req.token,
                });
            });
    },

    update_category: function (req, res) {
        upload(req, res, function (error) {
            var where = {};
            where["_id"] = req.body.id;

            let updateData = {
                name: req.body.name,
                update_date: moment().format(),
            }
            if(req.body.parent && req.body.parent != "" && req.body.parent != "null") updateData['parent'] = req.body.parent

            if (error) {                
                return res.status(200).send({
                    status: "error",
                    message: "Unexpected Error",
                });
            } else {
                if (req.file) {
                    updateData["file"] = req.file.path.replace(/\\/g, "/").replace("public", process.env.BASE_URL);
                } else {
                    updateData["file"] = req.body.old_image;
                }
            }
            Category.findOneAndUpdate(where, updateData, {
                new: true,
            })
            .exec()
            .then((response) => {
                res.status(200).send({
                    status: "success",
                    message: "Category has been updated..",
                    token: req.token,
                });
            })
            .catch((err) => {
                console.log(err)
                res.status(200).send({
                    status: "error",
                    message: err,
                });
            });
        });
    },

    /// End Category ///

    /// Start Questions ///
    question_list: function (req, res) {
        var where = {};
        if(req.body.category && req.body.category != "") where["category"] = req.body.category
        where["deleted"] = 0;

        Question.find(where, null, {
            limit: parseInt(req.body.limit),
            skip: parseInt(req.body.page),
        })
            .populate("category", "name")
            .sort({
                update_date: -1,
            })
            .then((response) => {
                // console.log("CATL",response.length)
                Question.find(where).countDocuments(function (err, count) {
                    // console.log("CATC",count)
                    res.status(200).send({
                        status: "success",
                        token: req.token,
                        result: response,
                        totalCount: count,
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: error });
            });
    },
    add_question: function (req, res) {
        req.body.created_date = moment().format()
        req.body.update_date = moment().format()
        req.body.answers = JSON.parse(req.body.answers)
        // console.log(req.body.type)

        if(req.body.type == 'image') {
            let fileName = getRandomFileName()
            let base64String = req.body.question
            // Remove header
            let base64Image = base64String.split(';base64,').pop();
            fs.writeFile(`./public/${fileName}.png`, base64Image, {encoding: 'base64'}, function(err) {
                console.log(`File created at public/${fileName}.png`);
            });
            req.body.question = `${process.env.BASE_URL}/${fileName}.png`
        }

        let answersArr = []
        if (req.body.answerType == "image") {
            let answers = req.body.answers
            for(let i=0; i<answers.length; i++) {
                // http://localhost:5000/image-1632407391384.jpg
                let imageBase64 = ""
                if(answers[i].title && answers[i].title != "") {
                    let fileName = getRandomFileName()
                    let base64String = answers[i].title
                    // Remove header
                    let base64Image = base64String.split(';base64,').pop();
                    fs.writeFile(`./public/${fileName}.png`, base64Image, {encoding: 'base64'}, function(err) {
                        console.log(`File created at public/${fileName}.png`);
                    });
                    imageBase64 = `${process.env.BASE_URL}/${fileName}.png`
                }
                answersArr.push({
                    title: imageBase64,
                    is_correct: answers[i].is_correct,
                    type: req.body.answerType
                })
            }
            req.body.answers = answersArr
        }

        // console.log(req.body)

		var questionData = new Question(req.body);

        questionData.save(function (err, savedData) {
            if (err) {
                res.status(200).send({ status: "error", message: err });
                if(req.body.type == "image") {
                    try {
                        if (fs.existsSync(req.body.question.replace(process.env.BASE_URL, "public"))) {
                            fs.unlinkSync(req.body.question.replace(process.env.BASE_URL, "public"), function (err) {
                                if (err) console.log(err);
                            });
                            console.log("Previous file deleted");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
                if(req.body.answerType == "image") {
                    let answers = req.body.answers
                    for(let i=0; i<answers.length; i++) {
                        try {
                            if (fs.existsSync(answers[i].title.replace(process.env.BASE_URL, "public"))) {
                                fs.unlinkSync(answers[i].title.replace(process.env.BASE_URL, "public"), function (err) {
                                    if (err) console.log(err);
                                });
                                console.log("Previous file deleted");
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
            }else res.status(200).send({ status: "success", message: "Question has been successfully created." });
        });
	},
    update_question: async function (req, res) {
		var where = {};
		where["_id"] = req.body.id;

        let question = await Question.findOne(where)
        if(!question) return res.status(200).send({ status: "error", message: "Question not found." });

        req.body.update_date = moment().format()

        req.body.answers = JSON.parse(req.body.answers)

        let oldQuestion = req.body.question
        let deleteAnswer = []
        
        if(req.body.type == 'image') {
            if(req.body.question.includes(';base64,')) {
                let fileName = getRandomFileName()
                let base64String = req.body.question
                // Remove header
                let base64Image = base64String.split(';base64,').pop();
                fs.writeFile(`./public/${fileName}.png`, base64Image, {encoding: 'base64'}, function(err) {
                    console.log(`File created at public/${fileName}.png`);
                });
                req.body.question = `${process.env.BASE_URL}/${fileName}.png`
            }
        }

        let answersArr = []
        if (req.body.answerType == "image") {
            let oldAnswers = req.body.answers
            for(let i=0; i<oldAnswers.length; i++) {
                let imageBase64 = oldAnswers[i].title
                // http://localhost:5000/image-1632407391384.jpg
                if(oldAnswers[i].title && oldAnswers[i].title != "") {
                    if(oldAnswers[i].title.includes(';base64,')) {
                        let fileName = getRandomFileName()
                        let base64String = oldAnswers[i].title
                        // Remove header
                        let base64Image = base64String.split(';base64,').pop();
                        fs.writeFile(`./public/${fileName}.png`, base64Image, {encoding: 'base64'}, function(err) {
                            console.log(`File created at public/${fileName}.png`);
                        });
                        deleteAnswer.push(imageBase64);
                        imageBase64 = `${process.env.BASE_URL}/${fileName}.png`
                    }
                }
                answersArr.push({
                    title: imageBase64,
                    is_correct: oldAnswers[i].is_correct,
                    type: req.body.answerType
                })
            }
            req.body.answers = answersArr
        }

		Question.findOneAndUpdate(
			where, req.body, {
				new: true
			}
		)
		.exec()
		.then((response) => {
            res.status(200).send({ status: "success", message: "Question has been updated." });
            if(req.body.type == 'image') {
                if(oldQuestion.includes(';base64,') && question.question.includes(process.env.BASE_URL)) {
                    try {
                        if (fs.existsSync(question.question.replace(process.env.BASE_URL, "public"))) {
                            fs.unlinkSync(question.question.replace(process.env.BASE_URL, "public"), function (err) {
                                if (err) console.log(err);
                            });
                            console.log("Previous file deleted");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
            if(req.body.type == 'text' && question.type == 'image') {
                try {
                    if (fs.existsSync(question.question.replace(process.env.BASE_URL, "public"))) {
                        fs.unlinkSync(question.question.replace(process.env.BASE_URL, "public"), function (err) {
                            if (err) console.log(err);
                        });
                        console.log("Previous file deleted");
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            if(req.body.answerType == "text" && question.answers.length > 0 && question.answers[0].type == "image") {
                for (let i = 0; i < question.answers.length; i++) {
                    try {
                        if (fs.existsSync(question.answers[i].title.replace(process.env.BASE_URL, "public"))) {
                            fs.unlinkSync(question.answers[i].title.replace(process.env.BASE_URL, "public"), function (err) {
                                if (err) console.log(err);
                            });
                            console.log("Previous file deleted");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
            if(req.body.answerType == "image") {
                let deleteList = JSON.parse(req.body.deleteList);
                for (let i = 0; i < deleteList.length; i++) {
                    try {
                        if (fs.existsSync(deleteList[i].replace(process.env.BASE_URL, "public"))) {
                            fs.unlinkSync(deleteList[i].replace(process.env.BASE_URL, "public"), function (err) {
                                if (err) console.log(err);
                            });
                            console.log("Previous file deleted");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
		})
		.catch((error) => {
			res.status(200).send({ status: "error", message: "Something went wrong" });
            if(req.body.type == 'image') {
                if(oldQuestion.includes(';base64,')) {
                    try {
                        if (fs.existsSync(req.body.question.replace(process.env.BASE_URL, "public"))) {
                            fs.unlinkSync(req.body.question.replace(process.env.BASE_URL, "public"), function (err) {
                                if (err) console.log(err);
                            });
                            console.log("Previous file deleted");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
            if(req.body.answerType == "image") {
                for (let i = 0; i < deleteAnswer.length; i++) {
                    try {
                        if (fs.existsSync(deleteAnswer[i].replace(process.env.BASE_URL, "public"))) {
                            fs.unlinkSync(deleteAnswer[i].replace(process.env.BASE_URL, "public"), function (err) {
                                if (err) console.log(err);
                            });
                            console.log("Previous file deleted");
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
		});
	},
    delete_question: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;
        Question.findOneAndUpdate(
            where,
            {
                deleted: 1,
            },
            {
                new: true,
            }
        )
            .exec()
            .then((response) => {
                res.status(200).send({ status: "success", message: "Question has been deleted" });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: "Something went wrong" });
            });
    },

    // Customers
    customer_list: function (req, res) {
        var where = {};

        // if (req.body.name && req.body.name != "") {
        //     where["$or"] = [
        //         { 
        //             firstName: {
        //                 $regex: ".*" + req.body.name,
        //                 $options: "i",
        //             }
        //         }, { 
        //             lastName: {
        //                 $regex: ".*" + req.body.name,
        //                 $options: "i",
        //             }
        //         }];
        // }

        // where['$expr'] = {
        //     $eq: [
        //         'Soumodeep Ganguly', { $concat: ['$first_name', '$last_name'] }
        //     ]
        // }
        if (req.body.search && req.body.search != "") {
            let search = req.body.search.toLowerCase()
            where["$or"] = [
                { 
                    first_name: {
                        $regex: ".*" + search,
                        $options: "i",
                    }
                }, { 
                    last_name: {
                        $regex: ".*" + search,
                        $options: "i",
                    }
                }, { 
                    email: {
                        $regex: ".*" + search,
                        $options: "i",
                    }
                }, { 
                    mobile: {
                        $regex: ".*" + search,
                        $options: "i",
                    }
                }];
        }

        where["deleted"] = 0;
        where["user_type"] = "customer";

        User.find(where, null, {
            limit: parseInt(req.body.limit),
            skip: parseInt(req.body.page),
        })
            .sort({
                created_date: 1,
            })
            .then((response) => {
                // console.log("CATL",response.length)
                User.find(where).countDocuments(function (err, count) {
                    // console.log("CATC",count)
                    res.status(200).send({ status: "success", result: response, totalCount: count });
                });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: error });
            });
    },

    update_user: function (req, res) {
        var where = {};
        where["_id"] = req.body.id || req.token._id;
        User.findOneAndUpdate(
            where, req.body,
            {
                new: true,
            }
        )
            .exec()
            .then((response) => {
                res.status(200).send({ status: "success", message: "User has been updated" });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: "Something went wrong" });
            });
    },

    get_user: function (req, res) {
        var where = {};
        where["_id"] = req.body.id || req.token._id;
        User.findOne(where)
            .exec()
            .then((response) => {
                res.status(200).send({ status: "success", data: response });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: "Something went wrong" });
            });
    },

    delete_customer: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;
        User.findOneAndUpdate(
            where,
            {
                deleted: 1,
            },
            {
                new: true,
            }
        )
            .exec()
            .then((response) => {
                res.status(200).send({ status: "success", message: "User has been deleted" });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: "Something went wrong" });
            });
    },

    /// Test answers ///
    answers_list: function (req, res) {
        var where = {};
        if(req.body.category && req.body.category != "") where["category"] = req.body.category
        if(req.body.user && req.body.user != "") where["user"] = req.body.user
        where["deleted"] = 0;

        Answer.find(where, null, {
            limit: parseInt(req.body.limit),
            skip: parseInt(req.body.page),
        })
            .populate("category", "name")
            .populate("user", "first_name last_name")
            .sort({
                update_date: -1,
            })
            .then((response) => {
                // console.log("CATL",response.length)
                Answer.find(where).countDocuments(function (err, count) {
                    // console.log("CATC",count)
                    res.status(200).send({ status: "success", result: response, totalCount: count });
                });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: error });
            });
    },

    forum_question_list: function (req, res) {
        var where = {};
        if(req.body.category && req.body.category != "") where["category"] = req.body.category
        if(req.body.inactive) where["active"] = 0
        where["deleted"] = 0;

        ForumQuestion.find(where, null, {
            limit: parseInt(req.body.limit),
            skip: parseInt(req.body.page)
        })
            .populate("category", "name")
            .populate("user", "first_name last_name email mobile profile_image")
            .sort({
                update_date: -1,
            })
            .then((response) => {
                // console.log("CATL",response.length)
                ForumQuestion.find(where).countDocuments(function (err, count) {
                    // console.log("CATC",count)
                    res.status(200).send({
                        status: "success",
                        result: response,
                        totalCount: count,
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: error });
            });
    },

    forum_reply_list: function (req, res) {
        var where = {};
        if(req.body.category && req.body.category != "") where["category"] = req.body.category
        if(req.body.question && req.body.question != "") where["question"] = req.body.question
        if(req.body.inactive) where["active"] = 0
        where["deleted"] = 0;

        ForumReply.find(where, null, {
            limit: parseInt(req.body.limit),
            skip: parseInt(req.body.page)
        })
            .populate("category", "name")
            .populate("question", "question")
            .populate("user", "first_name last_name email mobile profile_image")
            .sort({
                update_date: -1,
            })
            .then((response) => {
                // console.log("CATL",response.length)
                ForumReply.find(where).countDocuments(function (err, count) {
                    // console.log("CATC",count)
                    res.status(200).send({
                        status: "success",
                        result: response,
                        totalCount: count,
                    });
                });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: error });
            });
    },

    approve_forum_question: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;
        ForumQuestion.findOneAndUpdate(
            where,
            {
                active: 1,
                updated_date: moment().format()
            },
            {
                new: true,
            }
        )
            .exec()
            .then((response) => {
                res.status(200).send({ status: "success", message: "Forum question has been approved" });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: "Something went wrong" });
            });
    },

    delete_forum_question: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;
        ForumQuestion.findOneAndUpdate(
            where,
            {
                deleted: 1,
                updated_date: moment().format()
            },
            {
                new: true,
            }
        )
            .exec()
            .then((response) => {
                res.status(200).send({ status: "success", message: "Forum question has been deleted" });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: "Something went wrong" });
            });
    },

    approve_forum_reply: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;
        ForumReply.findOneAndUpdate(
            where,
            {
                active: 1,
                updated_date: moment().format()
            },
            {
                new: true,
            }
        )
            .exec()
            .then((response) => {
                res.status(200).send({ status: "success", message: "Forum question has been approved" });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: "Something went wrong" });
            });
    },

    delete_forum_reply: function (req, res) {
        var where = {};
        where["_id"] = req.body.id;
        ForumReply.findOneAndUpdate(
            where,
            {
                deleted: 1,
                updated_date: moment().format()
            },
            {
                new: true,
            }
        )
            .exec()
            .then((response) => {
                res.status(200).send({ status: "success", message: "Forum question has been deleted" });
            })
            .catch((error) => {
                res.status(200).send({ status: "error", message: "Something went wrong" });
            });
    },
};
