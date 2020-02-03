const { Rental, validateRental } = require("../models/rental");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const admin = require("../middleware/admin");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const express = require("express");
const router = express.Router();
const Fawn = require("fawn");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

Fawn.init(mongoose);

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.post("/", [auth, validate(validateRental)], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid Customer");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid Movie");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie is not in stock");

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      isGold: customer.isGold,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    },
    dateOut: req.body.dateOut,
    dateReturned: req.body.dateReturned,
    rentalFee: req.body.rentalFee
  });
  try {
    new Fawn.Task()
      .save("rentals", rental)
      .update(
        "movies",
        { _id: movie._id },
        {
          $inc: { numberInStock: -1 }
        }
      )
      .run();
  } catch (ex) {
    res.status(500).send("something failed.");
  }

  res.send(rental);
});

router.put(
  "/:id",
  [auth, validate(validateRental), validateObjectId],
  async (req, res) => {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("Invalid Customer");

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("Invalid Movie");

    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      {
        customer: {
          name: customer.name,
          isGold: customer.isGold,
          phone: customer.phone
        },
        movie: {
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate
        },
        dateOut: req.body.dateOut,
        dateReturned: req.body.dateReturned,
        rentalFee: req.body.rentalFee
      },
      { new: true }
    );

    res.send(rental);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const rental = await Rental.findByIdAndRemove(req.params.id);
  if (!rental) return res.status(400).send("Invalid rental");
  res.send(rental);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(400).send("Invalid rental");
  res.send(rental);
});

module.exports = router;
