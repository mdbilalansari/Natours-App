const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.overview = catchAsync(async (req, res) => {
  // 1) Get tour data from the collection
  const tours = await Tour.find();

  // 2) Build Template
  // 3) Render the template using the tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested tour (including review and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build Template
  // 3) Render the template using the tour data
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://api.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests; connect-src 'self' https://api.mapbox.com https://events.mapbox.com;"
    )
    .render('tour', {
      title: `${tour.name} tour`,
      tour
    });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdnjs.cloudflare.com;"
    )
    .render('login', {
      title: 'Log into your account'
    });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

exports.getMyTour = catchAsync(async (req, res) => {
  // 1) Find all the bookings
  const bookings = await Booking.find({ user: req.user.id });
  console.log(bookings);

  // 2) Findt the tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour.id);
  console.log(tourIDs);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
