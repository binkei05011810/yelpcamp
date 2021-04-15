const express = require('express');
const catchAsync = require('../utilities/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage })

//Start a new Router
const campgroundRouter = express.Router();

campgroundRouter.route('/')
    //Add the index route to see all the campgrounds at the moment
    .get(catchAsync(campgrounds.index))
    //Add the route to receive info from the form and addd it to the db
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

//Render the create form
campgroundRouter.get('/new', isLoggedIn, campgrounds.renderNewForm);

campgroundRouter.route('/:id')
    //Add the route to go to each campground
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//Render the edit form
campgroundRouter.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = campgroundRouter;