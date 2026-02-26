const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/templates", express.static("templates"));
app.use("/uploads", express.static("uploads"));
app.use("/template-previews", express.static("templates/previews"));

module.exports = app;