const express = require("express");
const router = express.Router();
const multer = require("multer");
const certificateController = require("../controllers/certificateController");
const authMiddleware = require("../middlewares/authMiddleware");


// ---------------- MULTER CONFIG ----------------

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "templates/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });


// =======================================================
// =============== PROTECTED ROUTES ======================
// =======================================================


// 1️⃣ Upload Excel
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  certificateController.uploadExcel
);


// 2️⃣ Upload Template
router.post(
  "/upload-template",
  authMiddleware,
  upload.single("file"),
  certificateController.uploadTemplate
);
router.delete(
  "/template/:filename",
  authMiddleware,
  certificateController.deleteTemplate
);

// 3️⃣ Update Layout
router.put(
  "/layout",
  authMiddleware,
  certificateController.updateLayout
);


// 4️⃣ Get Admin Stats
router.get(
  "/admin-stats",
  authMiddleware,
  certificateController.getAdminStats
);


// 5️⃣ Get Templates List
router.get(
  "/templates",
  authMiddleware,
  certificateController.getTemplates
);


// 6️⃣ Add Certificate
router.post(
  "/",
  authMiddleware,
  certificateController.addCertificate
);


// =======================================================
// =============== PUBLIC ROUTES =========================
// =======================================================


// 7️⃣ Download Certificate
router.get(
  "/:id/download",
  certificateController.downloadCertificate
);


// 8️⃣ Get Certificate By ID
// ⚠ MUST BE LAST (dynamic route)
router.get(
  "/:id",
  certificateController.getCertificate
);


module.exports = router;