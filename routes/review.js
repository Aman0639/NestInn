const express = require("express"); 
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview ,isLoggedIn,isReviewAuthor} = require("../middleware.js");
const Reviewcontroller=require("../controller/review.js");

//post
router.post("/", isLoggedIn,validateReview, wrapAsync(Reviewcontroller.createReview));

//delete review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(Reviewcontroller.destroyReview));

module.exports = router;
