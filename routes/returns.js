const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { Rental } = require("../models/rental");
const auth = require("../middleware/auth");
const moment = require("moment");
const validate = require("../middleware/validate");

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  if (!req.body.customerId)
    return res.send(400).send("Customer was not provided");

  if (!req.body.movieId) return res.send(400).send("Movie was not provided");

  const rental = await Rental.findOne({
    "movie._id": req.body.movieId,
    "customer._id": req.body.customerId
  });
  if (!rental)
    return res.status(404).send("No rental was found by movie/customer");

  if (rental.dateReturned)
    return res.status(400).send("Return already processed");

  rental.dateReturned = new Date();
  const rentalDays = moment().diff(rental.dateOut, "days");
  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;

  await rental.save();

  res.status(200).send();
});

function validateReturn(req) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };
  return Joi.validate(req, schema);
}

module.exports = router;
