const customers = require("../routes/customers");
const users = require("../routes/users");
const movies = require("../routes/movies");
const rentals = require("../routes/rentals");
const auth = require("../routes/auth");
const error = require("../middleware/error");
const genres = require("../routes/genres");
const express = require("express");
const returns = require("../routes/returns");

module.exports = function(app) {
  app.use(express.json());
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });

  app.use("/api/genres", genres);
  app.use("/api/customers", customers);
  app.use("/api/movies", movies);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/returns", returns);
  app.use("/api/auth", auth);
  app.use(error);
};
