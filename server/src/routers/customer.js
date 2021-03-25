const express = require("express");
const router = new express.Router();
const multer = require("multer");
const sharp = require("sharp");
const Customer = require("../models/customer");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");
const cAuth = require("../middleware/customerAuth");

router.post("/customer", async (req, res) => {
  const customer = new Customer(req.body);

  try {
    await customer.save();
    sendWelcomeEmail(customer.email, customer.name);
    const token = await customer.generateAuthToken();
    res.status(201).send({ customer, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/customer/login", async (req, res) => {
  try {
    const customer = await Customer.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await customer.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/customer/logout", cAuth, async (req, res) => {
  try {
    req.user.token = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/customer/logoutALL", cAuth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/customer/profile", cAuth, async (req, res) => {
  res.send(req.user);
});

router.patch("/customer/profile", cAuth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "address", "contact", "email", "password"];
  const isValidOperation = updates.every((update) => {
    allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/customer/profile", cAuth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.status(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//profile pic
