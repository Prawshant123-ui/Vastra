const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

module.exports = app;