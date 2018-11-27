module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ["**/tests/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  moduleNameMapper: {
    "remix-plugin": "<rootDir>/src"
  },
};