const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const certificateController = require("../controllers/certificateController");
const authMiddleware = require("../middlewares/authMiddleware");

/* =====================================================
   MULTER CONFIG
===================================================== */

/* ===== Excel Storage ===== */
const excelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../uploads");
    const files = fs.readdirSync(uploadPath);
  
    const alreadyExists = files.some(f =>
      f.split("-").slice(1).join("-") === file.originalname
    );
  
    if (alreadyExists) {
      return cb(new Error("File already exists"), null);
    }
  
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadExcel = multer({ storage: excelStorage });

/* ===== Template Storage ===== */
const templateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../templates"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadTemplate = multer({ storage: templateStorage });

/* =====================================================
   PROTECTED ROUTES (ADMIN)
===================================================== */

/* ===== Excel Routes ===== */
router.put(
  "/excel/active",
  authMiddleware,
  certificateController.setActiveExcel
);

router.post("/upload", authMiddleware, (req, res) => {

  uploadExcel.single("file")(req, res, function (err) {

    if (err) {
      return res.status(400).json({ message: err.message });
    }

    certificateController.uploadExcel(req, res);
  });

});

router.get(
  "/excel/active",
  authMiddleware,
  certificateController.getActiveExcel
);

router.get(
  "/excel-list",
  authMiddleware,
  certificateController.getExcelList
);

router.delete(
  "/excel/:filename",
  authMiddleware,
  certificateController.deleteExcel
);

/* ===== Template Routes ===== */
router.post(
  "/upload-template",
  authMiddleware,
  uploadTemplate.single("file"),
  certificateController.uploadTemplate
);

router.get(
  "/templates",
  authMiddleware,
  certificateController.getTemplates
);

router.delete(
  "/template/:filename",
  authMiddleware,
  certificateController.deleteTemplate
);

/* ===== Layout & Stats ===== */
router.put(
  "/layout",
  authMiddleware,
  certificateController.updateLayout
);

router.get(
  "/admin-stats",
  authMiddleware,
  certificateController.getAdminStats
);

/* ===== Add Certificate ===== */
router.post(
  "/",
  authMiddleware,
  certificateController.addCertificate
);

/* =====================================================
   PUBLIC ROUTES (KEEP LAST)
===================================================== */

router.get(
  "/:id/download",
  certificateController.downloadCertificate
);

router.get(
  "/:id",
  certificateController.getCertificate
);

module.exports = router;