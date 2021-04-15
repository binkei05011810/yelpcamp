if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//Add all the needed packages
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const User = require('./models/user');

const ExpressError = require('./utilities/ExpressError');

//Require the Routers
const campgroundRouter = require('./routers/campgrounds');
const reviewRouter = require('./routers/reviews');
const userRouter = require('./routers/users');

//const mongoSanitize = require('express-mongo-sanitize');
//Starting an express server
const app = express();

//Connect mongoose with js
const dbUrl = process.env.DB_URL;
//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(function () { console.log('DATABASE CONNECTED') })
    .catch(function () { console.log('ERROR') })

app.engine('ejs', ejsMate);
//Set up the server
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const secret = process.env.SECRET || 'thisshouldbeabettersecret'
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e)
})

//Use middleware to tell the the server to parse the body 
const sessionConfig = {
    store,
    name: 'ss',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
//Use mongo to store the session
app.use(session(sessionConfig));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
//app.use(mongoSanitize);
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//How to store user in session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//Middleware for accessing Flash as res.locals 
//We will have access to success locally within a request - response cycle
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRouter);
app.use('/campgrounds', campgroundRouter);
app.use('/campgrounds/:campId/reviews', reviewRouter);

app.get('/', function (req, res) {
    res.render('home.ejs');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})
app.use((err, req, res, next) => {
    const {statusCode = 500, message = "Something went WRONG"} = err;
    //Send the status code out

    if (!err.message) {err.message = "Something went WRONG"};
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000
app.listen(port, function () {
    console.log(`Serving on port ${port}`);
}) 
