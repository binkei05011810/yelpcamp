const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary/index');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const {title, price, description, location} = req.body.campground;
    const newCamp = new Campground({title, price, description, location, author: req.user._id});

    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCamp.geometry = geoData.body.features[0].geometry;
    
    await newCamp.save();
    
    console.log(newCamp);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCamp._id}`);
}

module.exports.showCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await (await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')); 

    if (!campground) {
        req.flash('error', 'Can not find that campground');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const editCamp = await Campground.findById(id);

    if (!editCamp) {
        req.flash('error', 'Can not find that campground');
        return res.redirect('/campgrounds');
    }
    
    res.render('campgrounds/edit', { editCamp });
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    console.log(req.body);
    const afterEdit = await Campground.findByIdAndUpdate(id, req.body.campground, {new: true});
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    afterEdit.images.push(...imgs);
    await afterEdit.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }

        await afterEdit.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});

    } 

    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${afterEdit._id}`);   
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);

    req.flash('success', 'Successfully delete a campground')
    res.redirect(`/campgrounds`)
}

