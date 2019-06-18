const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ["**/tests/**/*.ts?(x)"],
  testPathIgnorePatterns: ['dist', 'old'],
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  collectCoverage: true,
  globals: {
    'ts-jest': {
      diagnostics: false // Needed to avoid conflicts with Cypress
    }
  }
};