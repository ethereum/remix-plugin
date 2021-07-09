module.exports = {
  displayName: 'engine-theia',
  testEnvironment: 'node',
  preset: '../../../jest.preset.js',
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!theia/plugin/.*)"
  ],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/packages/engine/theia',
};
