const mongoose = require("mongoose");
const Joi = require("joi");

const Movie = mongoose.model(
  "Movies",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 255
    },
    genre: {
      type: new mongoose.Schema({
        name: {
          type: String,
          require: true,
          minlength: 5,
          maxlength: 50
        }
      }),
      required: true
    },
    numberInStock: {
      type: Number,
      required: true,

      min: 0,
      max: 255
    },
    dailyRentalRate: {
      type: Number,
      required: true,
      min: 0,
      max: 255
    }
  })
);

function validateMovie(movie) {
  const schema = {
    title: Joi.string()
      .min(5)
      .max(255)
      .required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number()
      .required()
      .default(0)
      .min(0)
      .max(255),
    dailyRentalRate: Joi.number()
      .required()
      .min(0)
      .max(255)
  };

  return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validateMovie = validateMovie;
