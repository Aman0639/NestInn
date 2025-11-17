const express = require("express"); 
const router=express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const usercontroller=require("../controller/user.js");
//signup page
router.get("/signup",(usercontroller.renderSignupForm));

router.post("/signup", wrapAsync(usercontroller.signup));
//login page
router.get("/login",(usercontroller.renderLoginForm));
//
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", { 
    failureRedirect: "/login", 
    failureFlash: true 
  }),(usercontroller.login)
);


//log out
router.get("/logout", (usercontroller.logout));
module.exports=router;