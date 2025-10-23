/**
 * Jest multi-project configuration for NodCord.
 * Each project targets a distinct runtime surface (API, Discord bot, EJS views)
 * so that tests inherit the correct environment and compiler options.
 * @type {import('jest').Config}
 */
const sharedTestMatch = [
  '**/__tests__/**/*.(spec|test).[tj]s',
  '**/?(*.)+(spec|test).[tj]s'
];

const sharedModuleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1'
};

const sharedSetupFiles = ['<rootDir>/jest.setup.ts'];

const createProject = ({ displayName, testEnvironment, roots, extraSetupFiles = [] }) => ({
  displayName,
  preset: 'ts-jest',
  testEnvironment,
  roots,
  testMatch: sharedTestMatch,
  moduleNameMapper: sharedModuleNameMapper,
  setupFilesAfterEnv: [...sharedSetupFiles, ...extraSetupFiles],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      isolatedModules: false,
      diagnostics: {
        warnOnly: process.env.CI !== 'true'
      }
    }
  },
  maxWorkers: '50%',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
});

module.exports = {
  testTimeout: 30000,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'cobertura'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/junit',
        outputName: 'jest-junit.xml'
      }
    ]
  ],
  projects: [
    createProject({
      displayName: 'api',
      testEnvironment: 'node',
      roots: ['<rootDir>/src/api', '<rootDir>/src/config', '<rootDir>/src/database', '<rootDir>/tests/api']
    }),
    createProject({
      displayName: 'bot',
      testEnvironment: 'node',
      roots: ['<rootDir>/src/bot', '<rootDir>/src/scripts', '<rootDir>/tests/bot']
    }),
    createProject({
      displayName: 'views',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/src/views', '<rootDir>/src/client', '<rootDir>/tests/views'],
      extraSetupFiles: ['@testing-library/jest-dom']
    })
  ]
};
