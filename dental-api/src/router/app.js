module.exports = function (app) {
    var AppController = require("../controllers/AppController");

    const { check } = require("express-validator");
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET;

    function generateAccessToken(key) {
        // expires after half and hour (1800 seconds = 30 minutes)
        const accessToken = jwt.sign({ mobile: key }, JWT_SECRET, { expiresIn: "180000s" });
        return accessToken;
    }

    function authenticateToken(req, res, next) {
        // Gather the jwt access token from the request header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[0];

        //console.log(authHeader.split(' '));
        if (token == null) return res.sendStatus(401); // if there isn't any token

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(401);
            req.token = user;
            next(); // pass the execution off to whatever request the client intended
        });
    }

    app
        /// User Auth ///
        .post( "/app/sign-up", [], AppController.sign_up)
        
        .post("/app/sign-in", [
            check("username").trim().isLength({ min: 1 }).withMessage("Enter email or mobile"),
            check("password").trim().isLength({ min: 1 }).withMessage("Enter password"),
        ], AppController.sign_in)

        .post("/app/verify-otp", [
            check("username").trim().isLength({ min: 1 }).withMessage("Enter email or mobile"),
            check("otp").trim().isLength({ min: 1 }).withMessage("Enter otp")
        ], AppController.otp_verification)

        .post("/app/forgot-password", [
            check("username").trim().isLength({ min: 1 }).withMessage("Enter email or mobile"),
        ], AppController.forgot_password)

        .post("/app/change-password", [
            check("username").trim().isLength({ min: 1 }).withMessage("Enter email or mobile"),
            check("new_password").trim().isLength({ min: 1 }).withMessage("Enter new password"),
            check("old_password").trim().isLength({ min: 1 }).withMessage("Enter old password"),
        ],
        AppController.change_user_password)

        .post("/app/change-forgotten-password", [
            check("username").trim().isLength({ min: 1 }).withMessage("Enter email or mobile"),
            check("password").trim().isLength({ min: 1 }).withMessage("Enter new password"),
        ], AppController.change_forgotten_password)

        .post( "/app/update-profile", [], authenticateToken, AppController.update_user)

        .post( "/app/category-list", [], authenticateToken, AppController.category_list)

        .post( "/app/category-list/:type", [], authenticateToken, AppController.category_list)

        .post( "/app/question-list", [
            check("category_id").trim().isLength({ min: 1 }).withMessage("Enter category id"),
        ], authenticateToken, AppController.question_list)

        .post( "/app/add-test-result", [
            check("category").trim().isLength({ min: 1 }).withMessage("Enter category id"),
            check("total_marks").trim().isLength({ min: 1 }).withMessage("Enter total marks"),
            check("obtained_marks").trim().isLength({ min: 1 }).withMessage("Enter obtained marks")
        ], authenticateToken, AppController.add_answer_result)

        .post( "/app/add-forum-question", [
            check("category").trim().isLength({ min: 1 }).withMessage("Enter category id"),
            check("question").trim().isLength({ min: 1 }).withMessage("Enter question")
        ], authenticateToken, AppController.add_forum_question)

        .post( "/app/add-forum-reply", [
            check("category").trim().isLength({ min: 1 }).withMessage("Enter category id"),
            check("question").trim().isLength({ min: 1 }).withMessage("Enter question"),
            check("answers").trim().isLength({ min: 1 }).withMessage("Enter answers")
        ], authenticateToken, AppController.add_forum_reply)

        .post( "/app/forum-question-list/:type", [], authenticateToken, AppController.forum_question_list)

        .post( "/app/forum-reply-list/:type", [], authenticateToken, AppController.forum_reply_list)

        .post( "/app/delete-forum-question", [
            check("id").trim().isLength({ min: 1 }).withMessage("Enter question id")
        ], authenticateToken, AppController.delete_forum_question)

        .post( "/app/delete-forum-reply", [
            check("id").trim().isLength({ min: 1 }).withMessage("Enter reply id")
        ], authenticateToken, AppController.delete_forum_reply)
};
