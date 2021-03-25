const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Item = require("./item");
const Order = require("./order");

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      default: 0,
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
  },
  {
    timestamps: true,
  }
);

vendorSchema.virtual("items", {
  ref: "Item",
  localField: "_id",
  foreignField: "owner",
});

vendorSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "vendor",
});

vendorSchema.methods.toJSON = function () {
  const vendor = this;
  const vendorObject = vendor.toObject();

  delete vendorObject.password;
  delete vendorObject.tokens;
  delete vendorObject.image;

  return vendorObject;
};

vendorSchema.methods.generateAuthToken = async function () {
  const vendor = this;
  const token = jwt.sign(
    { _id: vendor._id.toString() },
    process.env.JWT_SECRET || "aditya"
  );

  vendor.tokens = vendor.tokens.concat({ token });
  await vendor.save();

  return token;
};

vendorSchema.statics.findByCredentials = async (email, password) => {
  const vendor = await vendor.findOne({ email });

  if (!vendor) {
    throw new Error("Unable to login!");
  }

  const isMatch = await bcrypt.compare(password, vendor.password);
  if (!isMatch) {
    throw new Error("Unable to login!");
  }
  return vendor;
};

vendorSchema.pre("save", async function (next) {
  const vendor = this;

  if (vendor.isModified("password")) {
    vendor.password = await bcrypt.hash(vendor.password, 8);
  }

  next();
});

vendorSchema.pre("remove", async function (next) {
  const vendor = this;
  await Item.deleteMany({ owner: vendor._id });
  await Order.deleteMany({ vendor: vendor._id });
});

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
