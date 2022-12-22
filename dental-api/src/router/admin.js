module.exports = function (app) {
    var AdminController = require("../controllers/AdminController");

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

        .post("/admin/dashboard", [], authenticateToken, AdminController.dashboard)

        /// Create Admin
        .post("/admin/create-super-admin", [], AdminController.create_admin)

        .post("/admin/change-password", [], authenticateToken, AdminController.change_password)

        .post(
            "/admin/login",
            [
                check("email").trim().isLength({ min: 1 }).withMessage("Enter email address").isEmail().withMessage("Invalid email address"),
                check("password").trim().isLength({ min: 1 }).withMessage("Enter password"),
            ],
            AdminController.login
        )

        .post("/admin/update-user", [], authenticateToken, AdminController.update_user)

        .post("/admin/get-user", [], authenticateToken, AdminController.get_user)

        /// Category Starts ///

        .post("/admin/add-category", [], authenticateToken, AdminController.add_category)

        .post("/admin/main-category-list", [], authenticateToken, AdminController.main_category_list)

        .post("/admin/parent-category-list", [], authenticateToken, AdminController.parent_category_list)

        .post("/admin/category-list", [], authenticateToken, AdminController.category_list)

        .post("/admin/category-list-test", [], authenticateToken, AdminController.category_list_test)

        .post("/admin/update-category-status", [], authenticateToken, AdminController.update_category_status)

        .post("/admin/get-single-category", [], authenticateToken, AdminController.get_category)

        .post("/admin/delete-category", [], authenticateToken, AdminController.delete_category)

        .post("/admin/update-category", [], authenticateToken, AdminController.update_category)

        /// Category Ends ///

        /// Question ///
        .post("/admin/question-list", [], authenticateToken, AdminController.question_list)

        .post('/admin/add-question', [], authenticateToken, AdminController.add_question)

        .post('/admin/update-question', [], authenticateToken, AdminController.update_question)

        .post("/admin/delete-question", [], authenticateToken, AdminController.delete_question)

        /// Customer ///
        .post("/admin/customer-list", [], authenticateToken, AdminController.customer_list)

        .post("/admin/delete-customer", [], authenticateToken, AdminController.delete_customer)

        /// Test Result ///
        .post("/admin/answer-list", [], authenticateToken, AdminController.answers_list)

        /// Forum ///
        .post("/admin/forum-question-list", [], authenticateToken, AdminController.forum_question_list)

        .post("/admin/forum-reply-list", [], authenticateToken, AdminController.forum_reply_list)

        .post("/admin/delete-forum-question", [], authenticateToken, AdminController.delete_forum_question)

        .post("/admin/approve-forum-question", [], authenticateToken, AdminController.approve_forum_question)

        .post("/admin/delete-forum-reply", [], authenticateToken, AdminController.delete_forum_reply)

        .post("/admin/approve-forum-reply", [], authenticateToken, AdminController.approve_forum_reply)
};
