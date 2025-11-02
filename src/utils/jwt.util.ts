/**
 * ------------------------------------------------------------
 * JWT Utility – Security & Performance
 * ------------------------------------------------------------
 *
 * Features:
 * - HS256 & RS256 algorithm support
 * - In-memory key caching (env or file-based)
 * - Access & Refresh token signing, verifying, rotating
 * - Secure cookie helpers
 * - Full TypeScript 5.x & jsonwebtoken@9.x compatibility
 */

import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import type { JwtPayload, SignOptions, VerifyOptions, Secret, PrivateKey } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import logger from '@/services/logger.service';

// ============================================================
// Type Definitions
// ============================================================

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role?: string;
  scopes?: string[];
  [key: string]: unknown;
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  tokenType: 'refresh';
  [key: string]: unknown;
}

export interface CookieOptions {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    domain?: string | undefined;
    path: string;
    maxAge?: number | undefined;
  };
}

// ============================================================
// Config
// ============================================================

const NODE_ENV = process.env['NODE_ENV'] ?? 'development';
const IS_PROD = NODE_ENV === 'production';

const JWT_ALG = (process.env['JWT_ALG'] ?? 'HS256').toUpperCase() as 'HS256' | 'RS256';
const JWT_ISSUER = process.env['JWT_ISSUER'] ?? 'nodcord';
const JWT_AUDIENCE = process.env['JWT_AUDIENCE'] ?? 'nodcord-app';

const JWT_ACCESS_EXPIRES: StringValue | number = (process.env['JWT_ACCESS_EXPIRES'] ??
  '15m') as StringValue;
const JWT_REFRESH_EXPIRES: StringValue | number = (process.env['JWT_REFRESH_EXPIRES'] ??
  '30d') as StringValue;

const JWT_CLOCK_TOLERANCE_SEC = Number(process.env['JWT_CLOCK_TOLERANCE'] ?? '5');

const COOKIE_DOMAIN = process.env['COOKIE_DOMAIN'];
const COOKIE_SECURE = (process.env['COOKIE_SECURE'] ?? (IS_PROD ? 'true' : 'false')) === 'true';

// ============================================================
// Key Management (Lazy Cached)
// ============================================================

let secretCache: Secret | null = null;
let privateKeyCache: PrivateKey | null = null;
let publicKeyCache: Secret | null = null;

function readKeyFromFile(filePath?: string): string | null {
  if (!filePath) return null;
  try {
    const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    return fs.readFileSync(abs, 'utf8');
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[JWT] Failed to read key file', { filePath, error: e.message });
    return null;
  }
}

function getHS256Secret(): Secret {
  if (secretCache) return secretCache;
  const secret = process.env['JWT_SECRET'];
  if (!secret?.trim()) {
    const msg = '[JWT] Missing JWT_SECRET for HS256';
    logger.error(msg);
    throw new Error(msg);
  }
  secretCache = secret;
  return secret;
}

function getRS256PrivateKey(): PrivateKey {
  if (privateKeyCache) return privateKeyCache;
  const key =
    process.env['JWT_PRIVATE_KEY'] ?? readKeyFromFile(process.env['JWT_PRIVATE_KEY_PATH']);
  if (!key?.trim()) {
    const msg = '[JWT] Missing JWT_PRIVATE_KEY or JWT_PRIVATE_KEY_PATH for RS256';
    logger.error(msg);
    throw new Error(msg);
  }
  privateKeyCache = key;
  return key;
}

function getRS256PublicKey(): Secret {
  if (publicKeyCache) return publicKeyCache;
  const key = process.env['JWT_PUBLIC_KEY'] ?? readKeyFromFile(process.env['JWT_PUBLIC_KEY_PATH']);
  if (!key?.trim()) {
    const msg = '[JWT] Missing JWT_PUBLIC_KEY or JWT_PUBLIC_KEY_PATH for RS256';
    logger.error(msg);
    throw new Error(msg);
  }
  publicKeyCache = key;
  return key;
}

// ============================================================
// Error Classes
// ============================================================

export class TokenExpiredAuthError extends Error {
  constructor(message = 'JWT token has expired') {
    super(message);
    this.name = 'TokenExpiredAuthError';
  }
}

export class InvalidTokenAuthError extends Error {
  constructor(message = 'JWT token is invalid') {
    super(message);
    this.name = 'InvalidTokenAuthError';
  }
}

// ============================================================
// Key Resolvers
// ============================================================

function resolveSignKey(): { key: Secret | PrivateKey; algorithm: 'HS256' | 'RS256' } {
  return JWT_ALG === 'RS256'
    ? { key: getRS256PrivateKey(), algorithm: 'RS256' }
    : { key: getHS256Secret(), algorithm: 'HS256' };
}

function resolveVerifyKey(): { key: Secret; algorithms: ('HS256' | 'RS256')[] } {
  return JWT_ALG === 'RS256'
    ? { key: getRS256PublicKey(), algorithms: ['RS256'] }
    : { key: getHS256Secret(), algorithms: ['HS256'] };
}

// ============================================================
// Token Signing & Verification
// ============================================================

export function signAccessToken(
  payload: Omit<AccessTokenPayload, 'iat' | 'exp'>,
  opts?: Partial<SignOptions>,
): string {
  const { key, algorithm } = resolveSignKey();

  const options: SignOptions = {
    algorithm,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: JWT_ACCESS_EXPIRES,
    ...(opts ?? {}),
  };

  try {
    return jwt.sign(payload, key as Secret, options);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('[JWT] Failed to sign access token', { error: error.message });
    throw error;
  }
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const { key, algorithms } = resolveVerifyKey();
  try {
    const verified = jwt.verify(token, key, {
      algorithms,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTolerance: JWT_CLOCK_TOLERANCE_SEC,
    } satisfies VerifyOptions);

    if (typeof verified === 'string') throw new InvalidTokenAuthError('Unexpected payload type');
    return verified as AccessTokenPayload;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      logger.warn('[JWT] Access token expired');
      throw new TokenExpiredAuthError();
    }
    logger.error('[JWT] Access token invalid', { error: err.message });
    throw new InvalidTokenAuthError(err.message);
  }
}

export function signRefreshToken(
  subject: string,
  extra?: Record<string, unknown>,
  opts?: Partial<SignOptions>,
): string {
  const { key, algorithm } = resolveSignKey();

  const payload = { sub: subject, tokenType: 'refresh', ...extra };
  const options: SignOptions = {
    algorithm,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: JWT_REFRESH_EXPIRES,
    ...(opts ?? {}),
  };

  try {
    return jwt.sign(payload, key as Secret, options);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('[JWT] Failed to sign refresh token', { error: error.message });
    throw error;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const { key, algorithms } = resolveVerifyKey();
  try {
    const verified = jwt.verify(token, key, {
      algorithms,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTolerance: JWT_CLOCK_TOLERANCE_SEC,
    } satisfies VerifyOptions);

    if (typeof verified === 'string') throw new InvalidTokenAuthError('Unexpected payload type');
    const payload = verified as RefreshTokenPayload;
    if (payload.tokenType !== 'refresh')
      throw new InvalidTokenAuthError('Invalid refresh token type');
    return payload;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      logger.warn('[JWT] Refresh token expired');
      throw new TokenExpiredAuthError();
    }
    logger.error('[JWT] Refresh token invalid', { error: err.message });
    throw new InvalidTokenAuthError(err.message);
  }
}

export function rotateRefreshToken(
  oldToken: string,
  extra?: Record<string, unknown>,
): { newRefreshToken: string; sub: string } {
  const payload = verifyRefreshToken(oldToken);
  const newRefreshToken = signRefreshToken(payload.sub, extra);
  return { newRefreshToken, sub: payload.sub };
}

// ============================================================
// Utility Helpers
// ============================================================

export function decodeToken(
  token: string,
): { header?: unknown; payload?: JwtPayload | string } | null {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded !== 'object') return null;
    return {
      header: (decoded as any).header,
      payload: (decoded as any).payload,
    };
  } catch {
    return null;
  }
}

export function extractBearer(authHeader?: string): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

// ============================================================
// Cookie Builders
// ============================================================

export function buildTokenCookie(
  name: string,
  value: string,
  maxAgeMs?: number,
  sameSite: 'none' | 'lax' | 'strict' = COOKIE_SECURE ? 'none' : 'strict',
): CookieOptions {
  return {
    name,
    value,
    options: {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite,
      domain: COOKIE_DOMAIN ?? undefined,
      path: '/',
      maxAge: maxAgeMs ?? undefined,
    },
  };
}

export function buildAccessTokenCookie(token: string): CookieOptions {
  const fifteenMin = 15 * 60 * 1000;
  return buildTokenCookie('access_token', token, fifteenMin, 'lax');
}

export function buildRefreshTokenCookie(token: string): CookieOptions {
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return buildTokenCookie('refresh_token', token, thirtyDays, 'strict');
}

// ============================================================
// Default Export
// ============================================================

export default Object.freeze({
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  rotateRefreshToken,
  decodeToken,
  extractBearer,
  buildTokenCookie,
  buildAccessTokenCookie,
  buildRefreshTokenCookie,
});
