const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for processing
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, callback) => {
    if (file.mimetype !== 'application/pdf' || !file.originalname.toLowerCase().endsWith('.pdf')) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'resume'));
    }

    callback(null, true);
  },
});

module.exports = upload;