const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { checkDiskSpace } = require('check-disk-space');

// Definiere den Speicherort für die Uploads
const uploadDirectory = path.join(__dirname, '../../public/uploads');
const maxDiskSpacePercentage = 80; // Schwelle für den verfügbaren Speicherplatz in Prozent

// Stelle sicher, dass das Verzeichnis existiert
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Konfiguriere Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const filename = `${basename}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed!'));
};

// Middleware für Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB Maximalgröße
  }
}).single('file');

// Middleware zur Überprüfung des verfügbaren Speicherplatzes
const checkDiskSpaceMiddleware = async (req, res, next) => {
  try {
    const diskSpace = await checkDiskSpace(uploadDirectory);
    const totalSpace = diskSpace.size;
    const freeSpace = diskSpace.free;
    const usedSpacePercentage = ((totalSpace - freeSpace) / totalSpace) * 100;

    if (usedSpacePercentage >= maxDiskSpacePercentage) {
      return res.status(507).json({ error: 'Insufficient storage space' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  checkDiskSpaceMiddleware
};
