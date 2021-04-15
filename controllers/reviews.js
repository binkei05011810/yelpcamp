const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
    const inputReview = req.body.review;
    newReview = new Review(inputReview);
    newReview.author = req.user._id;

    await newReview.save();

    const {campId} = req.params;
    const campground = await Campground.findById(campId);
    campground.reviews.push(newReview);

    await campground.save();

    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campId}`); 
}

module.exports.deleteReview = async (req, res, next) => {
    const {campId, reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId); 
    await Campground.findByIdAndUpdate(campId, {$pull: {reviews: reviewId}})

    req.flash('success', 'Successfully delete a review')
    res.redirect(`/campgrounds/${campId}`);  d
}