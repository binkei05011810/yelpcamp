const express = require('express');
const catchAsync = require('../utilities/catchAsync');
const reviews = require('../controllers/reviews');

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')

//Start a new Router
const reviewRouter = express.Router({mergeParams: true});

//REVIEW ROUTES
reviewRouter.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

reviewRouter.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = reviewRouter;