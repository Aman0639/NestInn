const express = require("express");
const router = express();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,isOwner } = require("../middleware.js");
const {validateListing}=require("../middleware.js");
const multer=require('multer');
const {storage}=require("../cloudcofig.js");
const upload=multer({storage});
//validate
// Root
// INDEX - Show all listings
// Root
const listingscontroller=require("../controller/listing.js");
// INDEX
router.route("/")
.get(wrapAsync(listingscontroller.index))
.post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingscontroller.createListing))
// NEW
router.get("/new", isLoggedIn, (listingscontroller.renderNewForm));

// SHOW

router
    .route("/:id")
    .get(wrapAsync(listingscontroller.showListing))
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingscontroller.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingscontroller.destroyListing));

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,isOwner,
  wrapAsync(listingscontroller.renderEditForm)
);


module.exports = router;
