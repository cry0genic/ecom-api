const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");

const cAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "aditya");
    const customer = await Customer.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!customer) {
      throw new Error();
    }
    (req.token = token), (req.user = customer), next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = cAuth;
