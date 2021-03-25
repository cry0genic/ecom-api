const express = require("express");
require("./db/mongoose");

const customerRouter = require("./routers/customer");
const vendorRouter = require("./routers/vendor");
const itemRouter = require("./routers/item");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(customerRouter);
app.use(vendorRouter);
app.use(itemRouter)

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
