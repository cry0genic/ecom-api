const express = require("express");
const router = new express.Router();
const Item = require("../models/item");
const vAuth = require("../middleware/vAuth");
const multer = require("multer");
const sharp = require("sharp");

// Item Add/Remove/Edit by Vendor

router.post("/item", vAuth, async (req, res) => {
  const item = new Item({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await item.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/item", vAuth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user.populate({
        path: "items",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.items);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/item/:id", vAuth, async (req, res) => {
  const _id = req.params.id;

  try {
    const item = await Item.findOne({ _id, owner: req.user._id });
    if (!item) {
      return res.status(404).send();
    }
    res.send(item);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/item/:id", vAuth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "description", "cost", "image", "quantity"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "inavlid updates" });
  }
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!item) {
      return res.status(404).send();
    }
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await item.save();

    res.send(item);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/item/:id", vAuth, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!item) {
      res.status(404).send();
    }
    res.send(item);
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

router.post("/item/:id/image", vAuth, upload.single("image"), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.item[req.params.id].image = req.file.buffer;  
  await req.user.item[req.params.id].save();
  res.send();
},
(error, req, res, next) => {
  res.status(400).send({
    error: error.message, 
  });
}
);

// router.delete("/item/:id/image", vAuth, async (req, res) => {
// req.user.image = undefined;
// await req.user.save();
// res.send();
// });

// router.get("/item/:id/image", async (req, res) => {
// try {
//   const item = await Item.findById(req.params.id);

//   if (!item || !item.image) {
//     throw new Error();
//   }
//   res.set("Content-Type", "image/png");
//   res.send(item.image);
// } catch (e) {
//   res.status(404).send();
// }
// });




module.exports = router;

