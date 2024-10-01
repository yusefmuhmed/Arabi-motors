const router = require("express").Router();
const User = require("../app/controller/user.controller");
const upload = require("../app/middleware/fileUpload.middleware");
const { auth } = require("../app/middleware/user.auth.middleware");

const passport = require("passport");
require("../passport")
router.use(passport.initialize());
router.use(passport.session());


router.post("/register", upload, User.register);

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/api/user/login" }), (req, res) => {
    User.signInGoogleUser(req, res);
});

router.get("/", (req, res) => {

    res.render("connectToGoogle");

})

router.post("/login", User.login);

router.get("/profile", auth, User.profile);

router.patch("/updateInfo", auth, upload, User.updateInfo);

router.get("/logout", auth, User.logOut);

router.get("/users", auth, User.allUsers);

router.post("/resetPassword", User.resetPassword);

router.post("/verifyOTP", User.verifyOTP);

router.patch("/updatePassword", User.updatePassword);


module.exports = router;
