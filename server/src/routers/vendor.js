const express = require("express");
const router = new express.Router();
const multer = require("multer");
const sharp = require("sharp");
const Vendor = require("../models/vendor");
const {
  sendCancelationEmailtoVendor,
  sendWelcomeEmailtoVendor,
} = require("../emails/vendorEmail");
const vAuth = require("../middleware/vAuth");

// Vendor Reg / Login / Logout / Edit:Self-Profile / Edit:Self-Profile-Image

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

const upload = multer({
  limits: {
    fileSize: 9000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

router.post("/vendor/profile/image", vAuth, upload.single("image"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.image = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message,
    });
  }
);

router.delete("/vendor/profile/image", vAuth, async (req, res) => {
  req.user.image = undefined;
  await req.user.save();
  res.send();
});

router.get("/vendor/:id/image", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor || !vendor.image) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(Vendor.image);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
