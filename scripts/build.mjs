import { constants } from 'node:fs';
import {
  access,
  copyFile,
  mkdir,
  readdir,
  rm,
  readFile,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { transform } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const copyTargets = [
  { source: 'public', dest: 'public' },
  { source: 'keys', dest: 'keys' },
  { source: 'types', dest: 'types' },
  { source: 'uploads', dest: 'uploads' },
  { source: 'docs', dest: 'docs' },
];

const copyRootFiles = ['package.json'];

const TRANSPILE_RULES = new Map([
  ['.ts', { loader: 'ts', outExt: '.js', format: 'esm' }],
  ['.tsx', { loader: 'tsx', outExt: '.js', format: 'esm' }],
  ['.mts', { loader: 'ts', outExt: '.mjs', format: 'esm' }],
  ['.cts', { loader: 'ts', outExt: '.cjs', format: 'cjs' }],
  ['.js', { loader: 'js', outExt: '.js', format: 'esm' }],
  ['.mjs', { loader: 'js', outExt: '.mjs', format: 'esm' }],
  ['.cjs', { loader: 'js', outExt: '.cjs', format: 'cjs' }],
]);

async function exists(targetPath) {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(sourceDir, targetDir) {
  if (!(await exists(sourceDir))) return;

  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (!entry.isFile()) continue;

    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(sourcePath, targetPath);
  }
}

async function processSourceDirectory(sourceDir, targetDir) {
  if (!(await exists(sourceDir))) return;

  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await processSourceDirectory(sourcePath, targetPath);
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    const rule = TRANSPILE_RULES.get(ext);

    if (!rule) {
      if (ext === '.d.ts') continue;
      await mkdir(path.dirname(targetPath), { recursive: true });
      await copyFile(sourcePath, targetPath);
      continue;
    }

    const outputPath = targetPath.slice(0, -ext.length) + rule.outExt;
    const sourceCode = await readFile(sourcePath, 'utf8');
    const result = await transform(sourceCode, {
      loader: rule.loader,
      format: rule.format,
      minify: true,
      target: 'es2022',
      sourcemap: false,
      sourcesContent: false,
    });
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, result.code, 'utf8');
  }
}

async function removeSourceMaps(rootDir) {
  if (!(await exists(rootDir))) return;

  const entries = await readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      await removeSourceMaps(fullPath);
      continue;
    }

    if (!entry.isFile()) continue;

    if (path.extname(entry.name).toLowerCase() === '.map') {
      await rm(fullPath, { force: true });
    }
  }
}

async function main() {
  console.log('[Build] Cleaning dist directory…');
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  console.log('[Build] Transpiling src/ with esbuild…');
  await processSourceDirectory(path.join(projectRoot, 'src'), path.join(distDir, 'src'));

  for (const file of copyRootFiles) {
    const sourcePath = path.join(projectRoot, file);
    if (!(await exists(sourcePath))) continue;
    console.log(`[Build] Copying ${file} to dist/${file}…`);
    await copyFile(sourcePath, path.join(distDir, file));
  }

  console.log('[Build] Processing prisma/…');
  await processSourceDirectory(path.join(projectRoot, 'prisma'), path.join(distDir, 'prisma'));

  for (const { source, dest } of copyTargets) {
    const absoluteSource = path.join(projectRoot, source);
    if (!(await exists(absoluteSource))) continue;
    console.log(`[Build] Copying ${source}/ to dist/${dest}/…`);
    await copyDirectory(absoluteSource, path.join(distDir, dest));
  }

  const scriptsDir = path.join(projectRoot, 'scripts');
  if (await exists(scriptsDir)) {
    console.log('[Build] Minifying scripts/…');
    await processSourceDirectory(scriptsDir, path.join(distDir, 'scripts'));
  }

  console.log('[Build] Removing residual source maps…');
  await removeSourceMaps(distDir);
  console.log('[Build] Build artifacts available in dist/');
}

await main().catch((error) => {
  console.error('[Build] Failed', error);
  process.exitCode = 1;
});
