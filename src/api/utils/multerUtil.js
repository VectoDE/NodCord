const multer = require('multer');
const path = require('path');
const fs = require('fs');
const checkDiskSpace = require('check-disk-space').default;
const logger = require('../services/loggerService');

const uploadDirectory = path.join(__dirname, '../../public/uploads');
const maxDiskSpacePercentage = 80;

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
  logger.info(`Upload directory created at ${uploadDirectory}`);
} else {
  logger.info(`Upload directory already exists at ${uploadDirectory}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
    logger.info(`File upload destination set to ${uploadDirectory}`);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const filename = `${basename}-${Date.now()}${ext}`;
    cb(null, filename);
    logger.info(`File name set to ${filename}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    logger.info(`File type ${file.mimetype} is allowed`);
    return cb(null, true);
  }
  logger.warn(`File type ${file.mimetype} is not allowed`);
  cb(new Error('Only image files are allowed!'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).single('file');

const checkDiskSpaceMiddleware = async (req, res, next) => {
  try {
    const diskSpace = await checkDiskSpace(uploadDirectory);
    const totalSpace = diskSpace.size;
    const freeSpace = diskSpace.free;
    const usedSpacePercentage = ((totalSpace - freeSpace) / totalSpace) * 100;

    logger.info(
      `Disk space check: Total ${totalSpace}, Free ${freeSpace}, Used ${usedSpacePercentage}%`
    );

    if (usedSpacePercentage >= maxDiskSpacePercentage) {
      logger.warn(`Insufficient storage space: Used ${usedSpacePercentage}%`);
      return res.status(507).json({ error: 'Insufficient storage space' });
    }

    next();
  } catch (error) {
    logger.error('Error checking disk space:', error.message);
    next(error);
  }
};

module.exports = {
  upload,
  checkDiskSpaceMiddleware,
};
