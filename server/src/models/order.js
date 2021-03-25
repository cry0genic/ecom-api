const mongoose = require("mongoose");

const Item = require("./item");
const Customer = require("./customer");
const Vendor = require("./vendor");
const Cart = require("./cart");

const orderSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Item",
  },
  quantity: {
    type: Number,
    default: 1,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Vendor",
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
