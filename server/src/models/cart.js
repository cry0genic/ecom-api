const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    owner: {
      ref: "Customer",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    my_cart: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, //not sure
      ref: "Order",
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
