/**
 * Upload Document Middleware
 *
 * Configures Multer for library document uploads.
 * Accepts: pdf, txt, md, docx
 * Max size: 20MB
 * Destination: public/uploads/documents/
 */
const multer = require("multer");
const path = require("path");

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads/documents"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format non supporté. Utilisez PDF, TXT, MD ou DOCX."), false);
  }
};

const uploadDocument = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

module.exports = uploadDocument;