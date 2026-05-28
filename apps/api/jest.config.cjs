/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  maxWorkers: 1,
  collectCoverageFrom: [
    'src/routers/**/*.ts',
    'src/trpc/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup.ts',
  ],
  moduleNameMapper: {
    '^@mobiliza/db/auth$': '<rootDir>/src/__tests__/mocks/auth.ts',
    '^@mobiliza/realtime$': '<rootDir>/src/__tests__/mocks/realtime.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
        isolatedModules: true,
      },
    ],
  },
  verbose: true,
}

module.exports = config
