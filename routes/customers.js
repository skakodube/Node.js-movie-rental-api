const { Customer, validateCustomer } = require("../models/customer");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/", async (req, res) => {
  const customer = await Customer.find().sort("name");
  res.send(customer);
});

router.post("/", [auth, validate(validateCustomer)], async (req, res) => {
  let customer = new Customer({
    isGold: req.body.isGold,
    name: req.body.name,
    phone: req.body.phone
  });
  customer = await customer.save();
  res.send(customer);
});

router.put(
  "/:id",
  [auth, validate(validateCustomer), validateObjectId],
  async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isGold: req.body.isGold, name: req.body.name, phone: req.body.phone },
      { new: true }
    );
    if (!customer)
      return res.sendStatus(404).send("The customer with this ID wasn't found");
    res.send(customer);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);
  if (!customer)
    return res.sendStatus(404).send("The customer with this ID wasn't found");
  res.send(customer);
});

router.get("/:id", [validateObjectId], async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer)
    return res.sendStatus(404).send("The customer with this ID was not found");
  res.send(customer);
});

module.exports = router;
