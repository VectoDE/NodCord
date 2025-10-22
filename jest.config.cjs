/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/prisma'],
  testMatch: ['**/__tests__/**/*.(spec|test).[tj]s', '**/?(*.)+(spec|test).[tj]s'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'cobertura'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  maxWorkers: '50%',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      isolatedModules: true,
      diagnostics: {
        warnOnly: true
      }
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/junit',
        outputName: 'jest-junit.xml'
      }
    ]
  ]
};

module.exports = config;
