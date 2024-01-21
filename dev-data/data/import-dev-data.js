const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './config.env' });

// CONNECT TO DB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connection successful');
  })
  .catch(err => {
    console.log('DB connection failed: ', err);
  });

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

(async function() {
  try {
    // IMPORT DATA INTO BD
    if (process.argv[2] === '--import') {
      await Tour.create(tours);
      await User.create(users, { validateBeforeSave: false });
      await Review.create(reviews);
      console.log('Data successfully loaded!');
    }
    // DELETE DATA FROM DB
    if (process.argv[2] === '--delete') {
      await Tour.deleteMany();
      await User.deleteMany();
      await Review.deleteMany();
      console.log('Data successfully deleted!');
    }
  } catch (err) {
    console.log(err);
  } finally {
    setTimeout(() => {
      mongoose.connection.close(() => {
        console.log('DB connection closed successfully');
      });
    }, 3000);
  }
})();
