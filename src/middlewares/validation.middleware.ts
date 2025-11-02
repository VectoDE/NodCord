/**
 * ------------------------------------------------------------
 * Validation Middleware – Request Validation
 * ------------------------------------------------------------
 *
 * Purpose:
 * - Ultra-fast, type-safe schema validation for Express 5 routes
 * - Zero dependency, built-in validators, and async-safe
 * - Supports body, query, params, and headers validation
 *
 * Features:
 * - Precompiled validator functions for max speed
 * - Custom error responses via standardResponse()
 * - Auto logging & diagnostic reporting
 * - Full TypeScript inference for schema-based validation
 *
 * Utilities & Services:
 * - logger.service        : structured logs
 * - async.util            : safeAsync
 * - response.util         : standardResponse
 * - sync.util             : Once
 *
 * Tech:
 * - Node.js 20+, Express 5, TypeScript 5 strict
 * - exactOptionalPropertyTypes: true
 * - ESM (NodeNext)
 */

import type { Request, Response, NextFunction } from 'express';
import logger from '@/services/logger.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';
import { Once } from '@/utils/sync.util';

// ============================================================
// Types
// ============================================================

export type ValidatorFn<T = any> = (value: unknown) => value is T;

export interface ValidationSchema {
  body?: Record<string, ValidatorFn>;
  query?: Record<string, ValidatorFn>;
  params?: Record<string, ValidatorFn>;
  headers?: Record<string, ValidatorFn>;
}

export interface ValidationOptions {
  /** Whether to stop on first error. Default: true */
  abortEarly?: boolean;
  /** Log validation errors. Default: true */
  logErrors?: boolean;
  /** Return structured JSON error. Default: true */
  structuredError?: boolean;
  /** Custom error code for failed validation. Default: 400 */
  statusCode?: number;
}

interface NormalizedValidationOptions {
  abortEarly: boolean;
  logErrors: boolean;
  structuredError: boolean;
  statusCode: number;
}

// ============================================================
// Defaults
// ============================================================

const DEFAULTS: NormalizedValidationOptions = {
  abortEarly: true,
  logErrors: true,
  structuredError: true,
  statusCode: 400,
};

// ============================================================
// Built-in Validators (Enterprise Minimal Core)
// ============================================================

export const v = {
  string:
    (min = 0, max = Infinity): ValidatorFn<string> =>
    (val): val is string =>
      typeof val === 'string' && val.length >= min && val.length <= max,

  number:
    (min = -Infinity, max = Infinity): ValidatorFn<number> =>
    (val): val is number =>
      typeof val === 'number' && val >= min && val <= max,

  int:
    (min = -Infinity, max = Infinity): ValidatorFn<number> =>
    (val): val is number =>
      typeof val === 'number' && Number.isInteger(val) && val >= min && val <= max,

  boolean:
    (): ValidatorFn<boolean> =>
    (val): val is boolean =>
      typeof val === 'boolean',

  email:
    (): ValidatorFn<string> =>
    (val): val is string =>
      typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),

  uuid:
    (): ValidatorFn<string> =>
    (val): val is string =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),

  array:
    <T>(of: ValidatorFn<T>): ValidatorFn<T[]> =>
    (val): val is T[] =>
      Array.isArray(val) && val.every(of),

  object:
    <T extends object>(fields: Record<string, ValidatorFn>): ValidatorFn<T> =>
    (val): val is T =>
      typeof val === 'object' &&
      val !== null &&
      Object.entries(fields).every(([k, fn]) => fn((val as any)[k])),

  oneOf:
    <T>(...values: readonly T[]): ValidatorFn<T> =>
    (val): val is T =>
      (values as readonly unknown[]).includes(val),
};

// ============================================================
// Helpers
// ============================================================

function normalize(opts?: ValidationOptions): NormalizedValidationOptions {
  return {
    abortEarly: opts?.abortEarly ?? DEFAULTS.abortEarly,
    logErrors: opts?.logErrors ?? DEFAULTS.logErrors,
    structuredError: opts?.structuredError ?? DEFAULTS.structuredError,
    statusCode: opts?.statusCode ?? DEFAULTS.statusCode,
  };
}

function validateSection(
  data: Record<string, unknown>,
  schema: Record<string, ValidatorFn>,
  section: string,
  opts: NormalizedValidationOptions,
): string[] {
  const errors: string[] = [];

  for (const [key, validator] of Object.entries(schema)) {
    const value = data[key];
    const valid = validator(value);
    if (!valid) {
      errors.push(`${section}.${key}: invalid`);
      if (opts.abortEarly) break;
    }
  }

  return errors;
}

// ============================================================
// Middleware
// ============================================================

export function validationMiddleware(schema: ValidationSchema, options?: ValidationOptions) {
  const opts = normalize(options);
  const once = new Once<void>();

  return safeAsync(async (req: Request, res: Response, next: NextFunction) => {
    await once.run(async () => {
      logger.info('[VALIDATION] Middleware initialized', {
        sections: Object.keys(schema),
        strict: true,
      });
    });

    const errors: string[] = [];

    if (schema.body) errors.push(...validateSection(req.body ?? {}, schema.body, 'body', opts));
    if (schema.query)
      errors.push(
        ...validateSection(
          (req.query as Record<string, unknown>) ?? {},
          schema.query,
          'query',
          opts,
        ),
      );
    if (schema.params)
      errors.push(...validateSection(req.params ?? {}, schema.params, 'params', opts));
    if (schema.headers)
      errors.push(
        ...validateSection(
          (req.headers as Record<string, unknown>) ?? {},
          schema.headers,
          'headers',
          opts,
        ),
      );

    if (errors.length > 0) {
      if (opts.logErrors) logger.warn('[VALIDATION] Failed', { errors, path: req.originalUrl });

      if (opts.structuredError) {
        return standardResponse(
          res,
          opts.statusCode,
          {
            errors,
            timestamp: new Date().toISOString(),
          },
          'Validation Error',
        );
      }

      return res.status(opts.statusCode).send(errors.join('; '));
    }

    return next();
  });
}

// ============================================================
// Default export
// ============================================================

export default Object.freeze({
  validationMiddleware,
  v,
});
