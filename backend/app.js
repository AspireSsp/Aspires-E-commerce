const express = require("express");

const app = express();
const cookieParser = require('cookie-parser');
const errorMiddleware = require("./middlewares/error");
app.use(express.json());
app.use(cookieParser());

//    route are import here..
const product = require("./routes/productRoutes");
const user = require("./routes/userRoutes");
const order = require("./routes/orderRoutes");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);

//  Middleware for Errors
app.use(errorMiddleware);
module.exports = app;
