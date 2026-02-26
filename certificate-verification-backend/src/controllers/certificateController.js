const fs = require("fs");
const db = require("../config/db");
const { parseExcel } = require("../utils/excelParser");
const { fromPath } = require("pdf2pic");
function isValidDate(date) {
  return !isNaN(Date.parse(date));
}
exports.uploadTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfPath = req.file.path;
    const outputDir = path.join(__dirname, "../../templates/previews");

    // ✅ Create previews folder automatically
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log("Previews folder created");
    }

    const converter = fromPath(pdfPath, {
      density: 150,
      saveFilename: path.parse(req.file.filename).name,
      savePath: outputDir,
      format: "png",
      width: 1240,
      height: 1754,
    });

    await converter(1); // Convert first page

    console.log("Preview generated successfully");

    res.json({
      message: "Template uploaded and preview generated",
      filename: req.file.filename,
    });

  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: err.message });
  }
};
// Add Certificate (Protected)
exports.addCertificate = (req, res) => {
  const { certificate_id, student_name, domain, start_date, end_date } = req.body;

  // Basic validation
  if (!isValidDate(start_date) || !isValidDate(end_date)) {
  return res.status(400).json({ message: "Invalid date format" });
}
  if (!certificate_id || !student_name || !domain || !start_date || !end_date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check duplicate first
  const checkQuery = "SELECT * FROM certificates WHERE certificate_id = ?";
  
  db.query(checkQuery, [certificate_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(400).json({ message: "Certificate ID already exists" });
    }

    const insertQuery = `
      INSERT INTO certificates 
      (certificate_id, student_name, domain, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [certificate_id, student_name, domain, start_date, end_date],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ message: "Certificate added successfully" });
      }
    );
  });
};

// Get Certificate by ID (Public)
exports.getCertificate = (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM certificates WHERE certificate_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0)
      return res.status(404).json({ message: "Certificate not found" });

    res.json(results[0]);
  });
};



exports.uploadExcel = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let data;

  try {
    // ✅ Parse Excel safely
    data = parseExcel(req.file.path);
  } catch (error) {
    console.error("Excel Parse Error:", error);
    return res.status(400).json({
      message: "Invalid Excel format",
      filename: req.file.filename,
    });
  }

  if (!data || data.length === 0) {
    return res.json({
      message: "Excel is empty",
      filename: req.file.filename,
    });
  }

  db.query(
    "SELECT certificate_id FROM certificates",
    (err, existing) => {
      if (err) {
        console.error("DB Fetch Error:", err);
        return res.status(500).json({ error: err.message });
      }

      const existingIds = existing.map((c) => c.certificate_id);

      // ✅ Filter valid + non-duplicate rows
      const filteredData = data.filter(
        (row) =>
          row.certificate_id &&
          row.student_name &&
          row.domain &&
          row.start_date &&
          row.end_date &&
          !existingIds.includes(row.certificate_id)
      );

      if (filteredData.length === 0) {
        return res.json({
          message: "No new valid certificates found",
          filename: req.file.filename,
        });
      }

      const values = filteredData.map((row) => [
        row.certificate_id,
        row.student_name,
        row.domain,
        row.start_date,
        row.end_date,
      ]);

      const insertQuery = `
        INSERT INTO certificates 
        (certificate_id, student_name, domain, start_date, end_date)
        VALUES ?
      `;

      db.query(insertQuery, [values], (err, result) => {
        if (err) {
          console.error("DB Insert Error:", err);
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: "Excel uploaded successfully",
          insertedRows: result.affectedRows,
          skippedDuplicates: data.length - filteredData.length,
          filename: req.file.filename,
        });
      });
    }
  );
};

const { PDFDocument, rgb } = require("pdf-lib");
const path = require("path");
const fontkit = require("fontkit");

exports.downloadCertificate = async (req, res) => {
  const { id } = req.params;

  const certQuery = "SELECT * FROM certificates WHERE certificate_id = ?";
  const layoutQuery = "SELECT * FROM certificate_layouts WHERE template_name = 'default'";

  db.query(certQuery, [id], (err, certResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (certResults.length === 0)
      return res.status(404).json({ message: "Certificate not found" });

    db.query(layoutQuery, async (err, layoutResults) => {
      if (err) return res.status(500).json({ error: err.message });
      if (layoutResults.length === 0)
        return res.status(500).json({ message: "Layout not configured" });

      const certificate = certResults[0];
      const layout = layoutResults[0];

      const templatePath = path.join(
        __dirname,
        "../../templates/",
        layout.template_file
      );

      const templateBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);

      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      const nameFontBytes = fs.readFileSync(
        path.join(__dirname, "../../templates/", layout.name_font)
      );

      const bodyFontBytes = fs.readFileSync(
        path.join(__dirname, "../../templates/", layout.body_font)
      );

      const nameFont = await pdfDoc.embedFont(nameFontBytes);
      const bodyFont = await pdfDoc.embedFont(bodyFontBytes);

      const start = certificate.start_date.toISOString().split("T")[0];
      const end = certificate.end_date.toISOString().split("T")[0];

      // ===== NAME =====
      const name = certificate.student_name;
      const nameWidth = nameFont.widthOfTextAtSize(name, layout.name_size);

      page.drawText(name, {
        x: width * layout.name_x - nameWidth / 2,
        y: height * layout.name_y,
        size: layout.name_size,
        font: nameFont,
        color: rgb(0.75, 0.55, 0.15),
      });

      // ===== DOMAIN =====
      const domainWidth = bodyFont.widthOfTextAtSize(
        certificate.domain,
        layout.domain_size
      );

      page.drawText(certificate.domain, {
        x: width * layout.domain_x - domainWidth / 2,
        y: height * layout.domain_y,
        size: layout.domain_size,
        font: bodyFont,
      });

      // ===== START DATE =====
      page.drawText(start, {
        x: width * layout.start_x,
        y: height * layout.start_y,
        size: layout.start_size,
        font: bodyFont,
      });

      // ===== END DATE =====
      page.drawText(end, {
        x: width * layout.end_x,
        y: height * layout.end_y,
        size: layout.end_size,
        font: bodyFont,
      });

      const pdfBytes = await pdfDoc.save();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${id}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");

      res.send(Buffer.from(pdfBytes));
    });
  });
};
exports.updateLayout = (req, res) => {
  const {
    name_x,
    name_y,
    name_size,
    domain_x,
    domain_y,
    domain_size,
    start_x,
    start_y,
    start_size,
    end_x,
    end_y,
    end_size,
    name_font,
    body_font,
    template_file   // ✅ ADD THIS
  } = req.body;

  const query = `
    UPDATE certificate_layouts SET
      name_x=?, name_y=?, name_size=?,
      domain_x=?, domain_y=?, domain_size=?,
      start_x=?, start_y=?, start_size=?,
      end_x=?, end_y=?, end_size=?,
      name_font=?, body_font=?,
      template_file=?    -- ✅ ADD THIS
    WHERE template_name='default'
  `;

  db.query(
    query,
    [
      name_x, name_y, name_size,
      domain_x, domain_y, domain_size,
      start_x, start_y, start_size,
      end_x, end_y, end_size,
      name_font, body_font,
      template_file   // ✅ ADD THIS
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Layout updated successfully" });
    }
  );
};

exports.getAdminStats = (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) AS total FROM certificates", (err, result1) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalCertificates = result1[0].total;

    db.query("SELECT COUNT(*) AS total FROM certificate_layouts", (err, result2) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.totalTemplates = result2[0].total;

      db.query("SELECT template_file FROM certificate_layouts WHERE template_name='default'", (err, result3) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.activeTemplate = result3[0]?.template_file || "None";

        res.json(stats);
      });
    });
  });
};

exports.getTemplates = (req, res) => {
  const templatesDir = path.join(__dirname, "../../templates");

  fs.readdir(templatesDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });

    // Filter only PDF files
    const pdfTemplates = files.filter(file => file.endsWith(".pdf"));

    // Get active template from DB
    db.query(
      "SELECT template_file FROM certificate_layouts WHERE template_name='default'",
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const active = result[0]?.template_file || "";

        res.json({
          templates: pdfTemplates,
          active
        });
      }
    );
  });
};

exports.deleteTemplate = (req, res) => {
  const file = req.params.filename;
  const filePath = path.join(__dirname, "../../templates/", file);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.json({ message: "Template deleted" });
  }

  res.status(404).json({ message: "File not found" });
};


exports.getExcelList = (req, res) => {
  const uploadsDir = path.join(__dirname, "../../uploads");

  if (!fs.existsSync(uploadsDir)) {
    return res.json({ files: [] });
  }

  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const excelFiles = files.filter(file => file.endsWith(".xlsx"));

    res.json({ files: excelFiles });
  });
};

exports.deleteExcel = (req, res) => {
  const file = req.params.filename;
  const filePath = path.join(__dirname, "../../uploads/", file);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.json({ message: "Excel deleted" });
  }

  res.status(404).json({ message: "File not found" });
};

exports.getActiveExcel = (req, res) => {
  db.query(
    "SELECT active_file FROM excel_settings WHERE id=1",
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const active = result[0]?.active_file
        ? JSON.parse(result[0].active_file)
        : [];

      res.json({ active });
    }
  );
};

exports.setActiveExcel = (req, res) => {
  const { files } = req.body; // expect array

  if (!Array.isArray(files)) {
    return res.status(400).json({ message: "Files must be an array" });
  }

  const filesString = JSON.stringify(files);

  db.query(
    "UPDATE excel_settings SET active_file=? WHERE id=1",
    [filesString],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Active Excel updated" });
    }
  );
};