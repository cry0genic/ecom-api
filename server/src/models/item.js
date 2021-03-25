const mongoose = require("mongoose");

const Order = require("./order");
const Customer = require("./customer");
const Vendor = require("./vendor");
const Cart = require("./cart");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Vendor",
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    image: {
      type: Buffer,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    status: {
      Type: Boolean,
      default: true, //in stock etc
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "item",
});

itemSchema.pre("remove", async function (next) {
  const item = this;
  await Order.deleteMany({ item: item._id });
  next();
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
