const xlsx = require("xlsx");

// Convert Excel serial number to YYYY-MM-DD
function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  return date_info.toISOString().split("T")[0];
}

exports.parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rawData = xlsx.utils.sheet_to_json(sheet);

  const formattedData = rawData.map((row) => ({
    certificate_id: row.certificate_id,
    student_name: row.student_name,
    domain: row.domain,
    start_date:
      typeof row.start_date === "number"
        ? excelDateToJSDate(row.start_date)
        : row.start_date,
    end_date:
      typeof row.end_date === "number"
        ? excelDateToJSDate(row.end_date)
        : row.end_date,
  }));

  return formattedData;
};