import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve('dist');
mkdirSync(distDir, { recursive: true });

const importMap = {
  imports: {
    '@/': './dist/src/'
  }
};

writeFileSync(resolve(distDir, 'import-map.json'), JSON.stringify(importMap, null, 2));
