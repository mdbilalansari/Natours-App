const mongoose = require('mongoose');
const Tour = require('./tourModel');
// const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => +val.toFixed(1)
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// QUERY MIDDLEWARE: runs before .find() and .findOne()
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

// Static Methods
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nReviews: { $sum: 1 },
        averageRatings: { $avg: '$rating' }
      }
    }
  ]);
  if (stats[0]) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].averageRatings,
      ratingsQuantity: stats[0].nReviews
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0
    });
  }
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE: runs before save or create method only
reviewSchema.post('save', function(doc, next) {
  // return Review.calcAverageRatings(this.tour);
  this.constructor.calcAverageRatings(this.tour);
  next();
});

//// findByIdAndUpdate
//// findByIdAndDelete
reviewSchema.post(/^findOneAnd/, function(doc, next) {
  doc.constructor.calcAverageRatings(doc.tour);
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
