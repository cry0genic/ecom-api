const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Item = require("./item");
const Order = require("./order");
const Vendor = require("./vendor");
const Cart = require("./cart");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, //change it later?
    },
    address: {
      type: String,
      required: false,
    },
    contact: {
      type: Number,
      required: false,
      maxlength: 10,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("email is invalid");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    image: {
      type: Buffer,
    },
    money: {
      type: Number,
      default: 0, //integer?
    },
    password: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('password cannot contain "password"');
        }
      },
    },
    wishlist: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Item",
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.virtual("carts", {
  ref: "Cart",
  localField: "_id",
  foreignField: "owner",
});

customerSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "customer",
});

customerSchema.methods.toJSON = function () {
  const customer = this;
  const customerObject = customer.toObject();

  delete customerObject.password;
  delete customerObject.tokens;
  delete customerObject.image;

  return customerObject;
};

customerSchema.methods.generateAuthToken = async function () {
  const customer = this;
  const token = jwt.sign(
    { _id: customer._id.toString() },
    process.env.JWT_SECRET || "aditya"
  );

  customer.tokens = customer.tokens.concat({ token });
  await customer.save();

  return token;
};

customerSchema.statics.findByCredentials = async (email, password) => {
  const customer = await Customer.findOne({ email });

  if (!customer) {
    throw new Error("Unable to login!");
  }

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) {
    throw new Error("Unable to login!");
  }
  return customer;
};

customerSchema.pre("save", async function (next) {
  const customer = this;

  if (customer.isModified("password")) {
    customer.password = await bcrypt.hash(customer.password, 8);
  }

  next();
});

customerSchema.pre("remove", async function (next) {
  const cust = this;
  await Cart.deleteMany({ owner: cust._id });
  await Order.deleteMany({ customer: cust._id });
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
