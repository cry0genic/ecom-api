const express = require("express");
const router = new express.Router();
const cAuth = require("../middleware/customerAuth");
const Customer = require("../models/customer");

