/**
 * Upload Middleware
 *
 * Configures Multer for avatar mood image uploads.
 * Accepts: jpg, jpeg, png, webp
 * Max size: 5MB
 * Destination: public/uploads/moods/
 */
const multer = require("multer");
const path = require("path");

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads/moods"));
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
    cb(new Error("Format non supporté. Utilisez jpg, png ou webp."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB },
  fileFilter,
});

module.exports = upload;