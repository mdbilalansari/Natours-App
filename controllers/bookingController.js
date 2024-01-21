const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
// const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async function(req, res, next) {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create a ckeckout session
  const product = await stripe.products.create({
    name: `${tour.name} Tour`,
    description: tour.summary,
    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
  });

  const price = await stripe.prices.create({
    unit_amount: tour.price * 100, // amount in cents (or smallest currency unit)
    currency: 'inr',
    product: product.id // ID of the product created in the previous step
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${
      req.user.id
    }&price=${tour.price}`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price: price.id, // ID of the price created in the previous step
        quantity: 1
      }
    ],
    mode: 'payment'
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async function(req, res, next) {
  // This is only TEMPORARY, because it is UNSECURE: everyone can make booking without paying
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next();

  const booking = await Booking.findOne({ tour, user });
  if (!booking) {
    await Booking.create({ tour, user, price });
  }
  next();
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
