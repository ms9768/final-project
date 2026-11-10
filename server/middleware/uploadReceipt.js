const multer = require("multer");

const storage = multer.memoryStorage();

const uploadReceipt = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // עד 5MB
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("סוג הקובץ אינו נתמך"));
    }
  },
});

module.exports = uploadReceipt;