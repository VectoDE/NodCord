/**
 * ------------------------------------------------------------
 * Routes Collector Utility – Route Collector
 * ------------------------------------------------------------
 *
 * Features:
 * - Asynchronous, safe, and high-performance route introspection
 * - Recursively detects Express routes and nested routers
 * - Type-safe definitions for routes and router stack
 * - Logs discovered routes with Winston-compatible logger
 * - Supports ESM & CJS route modules seamlessly
 * - Uses Node.js native async FS APIs for optimal I/O throughput
 * - Immutable, side-effect-free result
 *
 * Tech:
 * - TypeScript 5.x (strict, verbatimModuleSyntax, exactOptionalPropertyTypes)
 * - Node.js 20+
 * - Express 5.x+
 */

import fs from 'fs/promises';
import path from 'path';
import express from 'express';
import type { Router, RequestHandler } from 'express';
import logger from '@/services/logger.service';

// ============================================================
// Types
// ============================================================

export interface RouteDefinition {
  method: string;
  path: string;
}

interface Layer {
  route?: {
    path: string;
    methods: Record<string, boolean>;
  };
  name?: string;
  handle?: Router | RequestHandler;
  regexp?: RegExp;
  keys?: Array<{ name: string }>;
  stack?: Layer[];
}

// ============================================================
// Helpers
// ============================================================

/**
 * Extracts route definitions from an Express router (recursively).
 */
export function extractRoutes(router: Router, basePath = ''): RouteDefinition[] {
  const stack: Layer[] = (router as any).stack || [];
  const routes: RouteDefinition[] = [];

  for (const layer of stack) {
    // Case 1: Direct route (method + path)
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods)
        .filter((m) => layer.route?.methods[m])
        .map((m) => m.toUpperCase());
      const routePath = path.posix.join(basePath, layer.route.path);

      for (const method of methods) {
        routes.push({ method, path: routePath });
        logger.info(`[ROUTE] Found: ${method} ${routePath}`);
      }
      continue;
    }

    // Case 2: Nested Router (recursively)
    if (layer.name === 'router' && (layer.handle as any)?.stack) {
      const prefix = basePath + cleanExpressPath(layer.regexp?.source ?? '') || '';

      const nested = extractRoutes(layer.handle as Router, prefix);
      for (const r of nested) routes.push(r);
    }
  }

  return routes;
}

/**
 * Normalizes and cleans up express regexp path strings.
 */
function cleanExpressPath(regexSource: string): string {
  if (!regexSource) return '';
  return regexSource
    .replace(/\\\//g, '/')
    .replace(/\^/, '')
    .replace(/\(\?:\(\[\^\\\/]\+\?\)\)\?\$$/, '')
    .replace(/\?\(\?=\(.+\)\)\?(?:.+)?$/, '')
    .replace(/\$$/, '');
}

/**
 * Dynamically imports a route file with both CJS and ESM support.
 */
async function importRouteModule(filePath: string): Promise<Router | undefined> {
  try {
    const mod = await import(filePath);
    const route = (mod.default ?? mod.router ?? mod) as unknown;

    // Validate router type properly
    if (route && typeof (route as any).use === 'function') {
      return route as express.Router;
    }

    logger.warn(`[ROUTES] ${filePath} did not export a valid Express Router`);
    return undefined;
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error(`[ROUTES] Failed to import ${filePath}`, { error: e.message });
    return undefined;
  }
}

// ============================================================
// Main Collector
// ============================================================

/**
 * Collects and inspects all routes from a given routes directory.
 * - Loads all .ts / .js files in directory
 * - Registers them into a temporary Router
 * - Recursively extracts method+path pairs
 */
export async function collectRoutes(routesDir: string): Promise<readonly RouteDefinition[]> {
  const absPath = path.isAbsolute(routesDir) ? routesDir : path.join(process.cwd(), routesDir);

  logger.info(`[ROUTES] Scanning directory: ${absPath}`);

  const router = express.Router();
  let files: string[] = [];

  try {
    const dirents = await fs.readdir(absPath, { withFileTypes: true });
    files = dirents
      .filter((d) => d.isFile() && /\.(t|j)s$/.test(d.name))
      .map((d) => path.join(absPath, d.name));
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error(`[ROUTES] Failed to read directory: ${absPath}`, { error: e.message });
    return [];
  }

  for (const file of files) {
    try {
      const route = await importRouteModule(file);
      if (!route) continue;

      router.use(route);
      logger.info(`[ROUTES] Loaded route file: ${path.basename(file)}`);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.error(`[ROUTES] Error loading ${file}`, { error: e.message });
    }
  }

  const routes = extractRoutes(router);

  logger.info(`[ROUTES] Total discovered: ${routes.length}`);

  // Make immutable and readonly
  return Object.freeze([...routes]);
}

// ============================================================
// Utility: Pretty Print Table (Optional)
// ============================================================

export function logRoutesTable(routes: readonly RouteDefinition[]): void {
  try {
    const rows = Array.from(routes).map((r) => ({
      METHOD: r.method.padEnd(7),
      PATH: r.path,
    }));
    const output = rows.map((r) => ` → ${r.METHOD} ${r.PATH}`).join('\n');
    logger.info('[ROUTES] Summary:\n' + output);
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logger.error('[ROUTES] Failed to log routes', { error: e.message });
  }
}

// ============================================================
// Default Export (Immutable)
// ============================================================

const routesCollector = Object.freeze({
  collectRoutes,
  extractRoutes,
  logRoutesTable,
});

export default routesCollector;
