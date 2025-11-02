/**
 * ------------------------------------------------------------
 * Multer Service – File Upload Management
 * ------------------------------------------------------------
 *
 * Features:
 * - Secure and configurable upload middleware
 * - Disk usage & quota validation before writes
 * - Auto directory creation (race-free)
 * - MIME and extension whitelist via array.util
 * - Unified response builder (response.util)
 * - Disk space monitoring (check-disk-space)
 * - Async-safe (async.util) + precise math (number.util)
 * - Integrated with logger.service
 *
 * Tech:
 * - TypeScript 5.x strict mode
 * - Node.js 20+
 * - Multer 1.4+
 * - Express 5.x+
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import checkDiskSpaceRaw from 'check-disk-space';
import logger from '@/services/logger.service';

// Type-only imports
import type { Request, Response, NextFunction } from 'express';
import type { FileFilterCallback } from 'multer';

export interface MulterInitOptions {
  allowedExtensions?: readonly string[];
  maxFileSize?: number;
  filenameGenerator?: (file: Express.Multer.File) => string;
}

// Internal Utilities
import { tryAsync } from '@/utils/async.util';
import { clampPercent, bytesToGB } from '@/utils/number.util';
import { ensureArrayIncludes } from '@/utils/array.util';
import { Mutex } from '@/utils/sync.util';
import responseUtil from '@/utils/response.util';
import { getBaseUrl } from '@/utils/baseUrl.util';

// ============================================================
// Config
// ============================================================

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const DISK_USAGE_THRESHOLD = 0.8; // 80%

const checkDiskSpace = checkDiskSpaceRaw as unknown as (
  path: string,
) => Promise<{ size: number; free: number }>;

// ============================================================
// Ensure Upload Directory (Thread-Safe)
// ============================================================

const dirLock = new Mutex();

async function ensureDirectory(dir: string): Promise<void> {
  await dirLock.runExclusive(async () => {
    try {
      await fs.mkdir(dir, { recursive: true });
      logger.debug(`[UPLOAD] Directory ensured: ${dir}`);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.error('[UPLOAD] Failed to create upload directory', {
        directory: dir,
        error: e.message,
      });
      throw e;
    }
  });
}

async function ensureUploadDirectory(): Promise<void> {
  await ensureDirectory(UPLOAD_DIR);
}

// ============================================================
// File Validation Utilities
// ============================================================

const ALLOWED_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function validateFile(file: Express.Multer.File): boolean {
  const ext = path.extname(file.originalname).toLowerCase();
  return (
    ensureArrayIncludes(ALLOWED_EXTENSIONS, ext, { caseInsensitive: true }) &&
    ensureArrayIncludes(ALLOWED_MIMES, file.mimetype, { caseInsensitive: true })
  );
}

function generateFilename(
  file: Express.Multer.File,
  generator?: (file: Express.Multer.File) => string,
): string {
  if (generator) {
    try {
      const custom = generator(file);
      if (typeof custom === 'string' && custom.trim().length > 0) {
        return custom.trim();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('[UPLOAD] Custom filename generator failed', { error: err.message });
    }
  }

  const ext = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  return `${baseName}-${unique}`;
}

// ============================================================
// Disk Space Validation
// ============================================================

async function hasSufficientDiskSpace(directory = UPLOAD_DIR): Promise<boolean> {
  const result = await tryAsync(() => checkDiskSpace(directory));
  if (!result.ok) {
    logger.error('[UPLOAD] Disk space check failed', { directory, error: result.error.message });
    return false;
  }

  const { size: total, free } = result.value;
  const usedRatio = (total - free) / total;
  const usedPct = clampPercent(usedRatio * 100);

  logger.info(
    `[UPLOAD] Disk (${directory}): ${bytesToGB(total).toFixed(2)}GB total | ${bytesToGB(free).toFixed(2)}GB free | Used=${usedPct.toFixed(1)}%`,
  );

  return usedRatio < DISK_USAGE_THRESHOLD;
}

// ============================================================
// Multer Storage Configuration
// ============================================================

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDirectory()
      .then(() => cb(null, UPLOAD_DIR))
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        cb(error, UPLOAD_DIR);
      });
  },
  filename: (_req, file, cb) => {
    const finalName = generateFilename(file);
    logger.debug(`[UPLOAD] Filename generated: ${finalName}`);
    cb(null, finalName);
  },
});

// ============================================================
// Multer File Filter
// ============================================================

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (!validateFile(file)) {
    logger.warn(`[UPLOAD] Invalid file type: ${file.mimetype}`);
    cb(new Error('Invalid file type. Only image formats allowed.'));
    return;
  }
  logger.debug(`[UPLOAD] File accepted: ${file.originalname}`);
  cb(null, true);
};

// ============================================================
// Multer Instance
// ============================================================

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('file');

// ============================================================
// Customizable Factory
// ============================================================

function deriveExtensionsFromMimes(mimes: readonly string[]): string[] {
  const derived = mimes
    .map((mime) => {
      if (typeof mime !== 'string') return null;
      const parts = mime.split('/');
      if (parts.length !== 2) return null;
      const subtype = parts[1]?.split('+')[0] ?? '';
      return subtype ? `.${subtype.toLowerCase()}` : null;
    })
    .filter((value): value is string => typeof value === 'string' && value.length > 0);

  return derived.length > 0 ? derived : ALLOWED_EXTENSIONS;
}

export function init(
  destination: string,
  allowedMimes: readonly string[],
  options: MulterInitOptions = {},
): multer.Multer {
  const normalizedExtensions =
    options.allowedExtensions?.map((ext) =>
      ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
    ) ?? deriveExtensionsFromMimes(allowedMimes);

  const limits = { fileSize: options.maxFileSize ?? MAX_FILE_SIZE };

  const customStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureDirectory(destination)
        .then(() => cb(null, destination))
        .catch((err) => {
          const error = err instanceof Error ? err : new Error(String(err));
          cb(error, destination);
        });
    },
    filename: (_req, file, cb) => {
      const name = generateFilename(file, options.filenameGenerator);
      cb(null, name);
    },
  });

  const customFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeAllowed = ensureArrayIncludes(allowedMimes, file.mimetype, { caseInsensitive: true });
    const extAllowed = ensureArrayIncludes(normalizedExtensions, ext, { caseInsensitive: true });

    if (!mimeAllowed || !extAllowed) {
      logger.warn('[UPLOAD] Custom uploader rejected file', { mimetype: file.mimetype, ext });
      cb(new Error('Invalid file type.'));
      return;
    }

    cb(null, true);
  };

  return multer({
    storage: customStorage,
    fileFilter: customFilter,
    limits,
  });
}

// ============================================================
// Middleware Wrapper (with Disk Check)
// ============================================================

export const uploadMiddleware = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  const hasSpace = await hasSufficientDiskSpace();
  if (!hasSpace) {
    logger.warn('[UPLOAD] Rejected upload due to low disk space');
    responseUtil.standardResponse(
      res,
      507,
      { error: 'Insufficient storage space available.' },
      'Insufficient storage space available.',
    );
    return;
  }

  uploader(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      logger.warn('[UPLOAD] Multer upload error', { code: err.code, message: err.message });
      responseUtil.standardResponse(res, 400, { error: err.message }, err.message);
      return;
    } else if (err instanceof Error) {
      logger.error('[UPLOAD] Upload failure', { error: err.message });
      responseUtil.standardResponse(res, 500, { error: err.message }, err.message);
      return;
    }

    if (!req.file) {
      responseUtil.standardResponse(res, 400, { error: 'No file uploaded.' }, 'No file uploaded.');
      return;
    }

    const baseUrl = getBaseUrl();
    const fileUrl = `/uploads/${req.file.filename}`;
    const absoluteUrl = `${baseUrl}${fileUrl}`;
    logger.info(`[UPLOAD] File uploaded successfully: ${fileUrl}`);

    responseUtil.standardResponse(
      res,
      200,
      {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        absoluteUrl,
      },
      'File uploaded successfully.',
    );
  });
};

// ============================================================
// Default Export
// ============================================================

export default Object.freeze({
  uploadMiddleware,
  ensureUploadDirectory,
  hasSufficientDiskSpace,
  init,
});
