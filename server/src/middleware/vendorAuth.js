const jwt = require("jsonwebtoken");
const Vendor = require("../models/vendor");

const vendorAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "aditya");
    const vendor = await vendor.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!vendor) {
      throw new Error();
    }
    (req.token = token), (req.vendor = user), next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = vendorAuth;
