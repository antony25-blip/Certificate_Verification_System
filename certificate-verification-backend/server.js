require("dotenv").config();

const express = require("express");
const path = require("path");

const app = require("./src/app");

const port = process.env.PORT || 3000;


// ===============================
// ✅ Serve Templates Folder (IMPORTANT)
// ===============================
app.use("/templates", express.static(path.join(__dirname, "templates")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ===============================
// ✅ Start Server
// ===============================
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

