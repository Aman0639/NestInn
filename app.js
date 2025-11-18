if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// Set up ejs-mate as the template engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ------------------------ MIDDLEWARE ------------------------
app.use(express.static(path.join(__dirname, "public"))); // static files
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(methodOverride("_method")); // PUT & DELETE via HTML forms
const ExpressError = require("./utils/ExpressError");
const { listingSchema,reviewSchema } = require("./schema.js");
const MongoStore=require('connect-mongo');
const reviewRoutes = require("./routes/review.js");
const passport=require("passport");
const Localstrategy=require("passport-local");
const User=require("./models/user.js");
const listingRoutes=require("./routes/listing.js");
const userRoutes=require("./routes/user.js");
// ------------------------ VIEW ENGINE ------------------------

// ------------------------ DATABASE ------------------------
// Define a fallback URL for local development in case ATLASDB is not set
const local_URL = "mongodb://127.0.0.1:27017/NestInn";
const DBurl = process.env.ATLASDB || local_URL; // <-- CORRECTED: Use fallback if ATLASDB is missing

mongoose.connect(DBurl)
 .then(() => console.log("Connected to MongoDB"))
 .catch((err) => console.log("DB Connection Error:", err));

// ------------------------ ROUTES ------------------------
const session=require("express-session");

// The MongoStore now always receives a string (either from ATLASDB or local_URL)
const store = MongoStore.create({
    mongoUrl: DBurl,
    crypto: {
    secret: process.env.SECRET,
    },
   touchAfter: 24 * 3600,
});

store.on("error", (err) => { // Added 'err' parameter here
      console.log("ERROR IN MONGO SESSION STORE", err);
})

const sessionOption= {
   store,
   secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
         expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
         maxAge: 7 * 24 * 60 * 60 * 1000,
         httpOnly: true,
     }
};
app.use(session(sessionOption));
const flash = require("connect-flash");

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req,res,next)=>{ 
   res.locals.success = req.flash("success"); 
   res.locals.error   = req.flash("error");
   res.locals.currUser=req.user;
    next();
});
//add review
app.use("/listings",listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/",userRoutes);
//delete listing;

// ------------------------ SERVER ------------------------
// Error handling middleware (should be near the end)
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
