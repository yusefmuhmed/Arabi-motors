const router = require("express").Router();
const User = require("../app/controller/user.controller");
const upload = require("../app/middleware/fileUpload.middleware");
const { auth } = require("../app/middleware/user.auth.middleware");

router.post("/register", upload, User.register);

router.post("/login", User.login);

router.get("/profile", auth, User.profile);

router.patch("/updateInfo", auth, upload, User.updateInfo);

router.get("/logout", auth, User.logOut);

router.get("/users", auth, User.allUsers);

router.post("/resetPassword", User.resetPassword);

router.post("/verifyOTP", User.verifyOTP);

router.patch("/updatePassword", User.updatePassword);


module.exports = router;
