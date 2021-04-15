//Add all the needed packages
const mongoose = require('mongoose');

//Require the models
const Campground = require('../models/campground');

//Import the seeds info
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

//Connect mongoose with js
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(function () { console.log('DATABASE CONNECTED') })
    .catch(function () { console.log('ERROR') })


const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 300; i++) {
        let randomCity = Math.floor(Math.random() * 1000);

        const newCamp = new Campground({
            author: "606eedaaa105579448dfa29d",
            location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/minhkhue181001/image/upload/v1618051998/YelpCamp/ytiyayfgv37lg6cbhh10.jpg',
                  filename: 'YelpCamp/ytiyayfgv37lg6cbhh10'
                },
                {
                  url: 'https://res.cloudinary.com/minhkhue181001/image/upload/v1618051999/YelpCamp/jomvqhakws75dxqbho5t.jpg',
                  filename: 'YelpCamp/jomvqhakws75dxqbho5t'
                }
            ],
            geometry: { 
                coordinates: [
                    cities[randomCity].longitude, 
                    cities[randomCity].latitude
                ],
                type: 'Point' 
            },
            description: 'The insight and experience of others is a valuable source of inspiration and motivation. And learning from successful leaders and entrepreneurs is a fantastic way to grow. Life throws curveballs. And while there might be blockers to success, it is imperative to keep pushing with the knowledge mistakes will be made and failure is inevitable.',
            price: Math.floor(Math.random() * 20) + 10
        })
        await newCamp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})