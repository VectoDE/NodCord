/**
 * ------------------------------------------------------------
 * Multer Service – File Upload Handling
 * ------------------------------------------------------------
 *
 * Provides:
 * - Secure and configurable file upload middleware
 * - Automatic upload directory creation
 * - File type & size validation
 * - Disk space monitoring before accepting uploads
 *
 * Technologies:
 * - Multer for handling multipart/form-data
 * - check-disk-space for disk usage checks
 * - Winston logger integration for observability
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import checkDiskSpaceRaw from 'check-disk-space';
import logger from '@/services/logger.service';

// Type-only imports (required when "verbatimModuleSyntax": true)
import type { FileFilterCallback } from 'multer';
import type { Request, Response, NextFunction } from 'express';

const checkDiskSpace = (checkDiskSpaceRaw as unknown as (path: string) => Promise<{ size: number; free: number }>);

// ============================================================
// Configuration
// ============================================================

const uploadDirectory = path.join(process.cwd(), 'uploads');
const maxDiskUsagePercentage = 80;
const maxFileSize = 10 * 1024 * 1024;

// ============================================================
// Directory Setup
// ============================================================

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
  logger.info(`[UPLOAD] Created upload directory at ${uploadDirectory}`);
} else {
  logger.debug(`[UPLOAD] Upload directory already exists at ${uploadDirectory}`);
}

// ============================================================
// Multer Storage Configuration
// ============================================================

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirectory),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    logger.info(`[UPLOAD] Saving file as: ${uniqueName}`);
    cb(null, uniqueName);
  },
});

// ============================================================
// File Filter (MIME & Extension Validation)
// ============================================================

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeAllowed = allowedTypes.test(file.mimetype);

  if (extAllowed && mimeAllowed) {
    logger.debug(`[UPLOAD] Accepted file type: ${file.mimetype}`);
    cb(null, true);
  } else {
    logger.warn(`[UPLOAD] Rejected file type: ${file.mimetype}`);
    cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed.'));
  }
};

// ============================================================
// Multer Upload Middleware
// ============================================================

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
}).single('file');

// ============================================================
// Disk Space Check Middleware
// ============================================================

export const checkDiskSpaceMiddleware = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { size: totalSpace, free: freeSpace } = await checkDiskSpace(uploadDirectory);
    const usedPercentage = ((totalSpace - freeSpace) / totalSpace) * 100;

    logger.info(
      `[UPLOAD] Disk usage: Total=${(totalSpace / 1_073_741_824).toFixed(2)}GB | Free=${(
        freeSpace / 1_073_741_824
      ).toFixed(2)}GB | Used=${usedPercentage.toFixed(2)}%`
    );

    if (usedPercentage >= maxDiskUsagePercentage) {
      logger.warn(`[UPLOAD] Insufficient storage: ${usedPercentage.toFixed(2)}% used`);
      res.status(507).json({ error: 'Insufficient storage space available.' });
      return;
    }

    next();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[UPLOAD] Disk space check failed', err);
    next(err);
  }
};

// ============================================================
// Export Default
// ============================================================

export default {
  upload,
  checkDiskSpaceMiddleware,
};
