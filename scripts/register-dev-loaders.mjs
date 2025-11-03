import { register } from 'node:module';

register('ts-node/esm', import.meta.url);
register('./alias-loader.mjs', import.meta.url);

