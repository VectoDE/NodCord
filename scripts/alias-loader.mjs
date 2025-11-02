import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve as pathResolve } from "node:path";

const ALIAS_PREFIX = "@/";

async function resolveAliasPath(relativePath) {
  const basePath = pathResolve("dist/src", relativePath);
  const potentials = [
    basePath,
    `${basePath}.js`,
    `${basePath}.mjs`,
    pathResolve(basePath, "index.js"),
    pathResolve(basePath, "index.mjs")
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
