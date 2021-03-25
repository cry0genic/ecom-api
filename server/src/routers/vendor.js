const express = require("express");
const router = new express.Router();
const multer = require("multer");
const sharp = require("sharp");
const Vendor = require("../models/vendor");
const {
  sendCancelationEmailtoVendor,
  sendWelcomeEmailtoVendor,
} = require("../emails/vendorEmail");
const vAuth = require("../middleware/vendorAuth");

router.post("/vendor", async (req, res) => {
  const vendor = new Vendor(req.body);

  try {
    await vendor.save();
    sendWelcomeEmailtoVendor(vendor.email, vendor.name);
    const token = await vendor.generateAuthToken();
    res.status(201).send({ vendor, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/vendor/login", async (req, res) => {
  try {
    const vendor = await Vendor.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await vendor.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/vendor/logout", vAuth, async (req, res) => {
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

router.post("/vendor/logoutALL", vAuth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/vendor/profile", vAuth, async (req, res) => {
  res.send(req.user);
});

router.patch("/vendor/profile", vAuth, async (req, res) => {
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

router.delete("/vendor/profile", vAuth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmailtoVendor(req.user.email, req.user.name);
    res.status(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//profile pic


