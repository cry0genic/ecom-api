const jwt = require("jsonwebtoken");
const Vendor = require("../models/vendor");

const vAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "aditya");
    const vendor = await Vendor.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!vendor) {
      throw new Error();
    }
    (req.token = token), (req.user = vendor), next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = vAuth;
