/* eslint-env node */
/* global __dirname, process */
/**
 * Jest multi-project configuration for NodCord.
 * Each project targets a distinct runtime surface (API, Discord bot, EJS views)
 * so that tests inherit the correct environment and compiler options.
 * @type {import('jest').Config}
 */
const sharedTestMatch = ['**/__tests__/**/*.(spec|test).[tj]s', '**/?(*.)+(spec|test).[tj]s'];

const fs = require('node:fs');
const path = require('node:path');

const sharedModuleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
  '@configs/(.*)$': '<rootDir>/src/configs/$1',
  '@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
  '@services/(.*)$': '<rootDir>/src/services/$1',
  '@utils/(.*)$': '<rootDir>/src/utils/$1',
};

const sharedSetupFiles = ['<rootDir>/jest.setup.ts'];

const filterExistingRoots = (rootDir, roots = []) =>
  roots
    .map((root) => path.resolve(rootDir, root.replace('<rootDir>/', '')))
    .filter((fullPath) => fs.existsSync(fullPath))
    .map((fullPath) => path.relative(rootDir, fullPath))
    .map((relativePath) => `<rootDir>/${relativePath.replace(/\\\\/g, '/')}`);

const createProject = ({ displayName, testEnvironment, roots, extraSetupFiles = [] }) => {
  const existingRoots = filterExistingRoots(__dirname, roots);
  if (existingRoots.length === 0) {
    return null;
  }

  return {
    displayName,
    preset: 'ts-jest/presets/default-esm',
    testEnvironment,
    roots: existingRoots,
    testMatch: sharedTestMatch,
    moduleNameMapper: sharedModuleNameMapper,
    setupFilesAfterEnv: [...sharedSetupFiles, ...extraSetupFiles],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transform: {
      '^.+\\.(t|j)sx?$': [
        'ts-jest',
        {
          tsconfig: '<rootDir>/tsconfig.jest.json',
          useESM: true,
          isolatedModules: false,
          diagnostics: {
            warnOnly: process.env.CI !== 'true',
          },
        },
      ],
    },
    maxWorkers: '50%',
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
  };
};

module.exports = {
  testTimeout: 30000,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'cobertura'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/junit',
        outputName: 'jest-junit.xml',
      },
    ],
  ],
  projects: [
    createProject({
      displayName: 'core',
      testEnvironment: 'node',
      roots: ['<rootDir>/src'],
    }),
  ].filter(Boolean),
};



