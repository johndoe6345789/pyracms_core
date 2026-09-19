const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Path to the Next.js app, to load next.config.js and .env files
  // in the test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/.next/',
    '/__tests__/helpers/',
  ],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 },
  },
}

// createJestConfig is exported this way so next/jest can load the
// (async) Next.js config
module.exports = createJestConfig(customJestConfig)
