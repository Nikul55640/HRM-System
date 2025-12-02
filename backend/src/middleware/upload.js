import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Allowed file types
const ALLOWED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_PATH || './uploads';
const tempDir = path.join(uploadDir, 'temp');
const documentsDir = path.join(uploadDir, 'documents');

// Ensure directories exist
[uploadDir, tempDir, documentsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in temp directory initially
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (ALLOWED_FILE_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG. Received: ${file.mimetype}`,
      ),
      false,
    );
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Middleware to handle multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }

  next();
};

// Cleanup temporary files
const cleanupTempFiles = async (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

// Cleanup old temporary files (older than 1 hour)
const cleanupOldTempFiles = () => {
  try {
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > oneHour) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old temp files:', error);
  }
};

// Schedule cleanup every hour
setInterval(cleanupOldTempFiles, 60 * 60 * 1000);

// Export utilities
export {
  upload,
  handleUploadError,
  cleanupTempFiles,
  cleanupOldTempFiles,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  uploadDir,
  tempDir,
  documentsDir,
};
