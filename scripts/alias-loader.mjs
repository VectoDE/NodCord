import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve as pathResolve } from "node:path";

const ALIAS_PREFIX = "@/";

async function resolveAliasPath(relativePath) {
  const distBase = pathResolve("dist/src", relativePath);
  const srcBase = pathResolve("src", relativePath);

  const potentials = [
    distBase,
    `${distBase}.js`,
    `${distBase}.mjs`,
    pathResolve(distBase, "index.js"),
    pathResolve(distBase, "index.mjs"),
    srcBase,
    `${srcBase}.ts`,
    `${srcBase}.mts`,
    `${srcBase}.js`,
    `${srcBase}.mjs`,
    pathResolve(srcBase, "index.ts"),
    pathResolve(srcBase, "index.mts"),
    pathResolve(srcBase, "index.js"),
    pathResolve(srcBase, "index.mjs")
  ];

  for (const candidate of potentials) {
    try {
      await access(candidate, constants.F_OK);
      return candidate;
    } catch {
      // continue
    }
  }

  return basePath;
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith(ALIAS_PREFIX)) {
    const relativePath = specifier.slice(ALIAS_PREFIX.length);
    const physicalPath = await resolveAliasPath(relativePath);
    return {
      url: pathToFileURL(physicalPath).href,
      shortCircuit: true
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}
