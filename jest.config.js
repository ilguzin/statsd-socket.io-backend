module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    "<rootDir>/built/",
    "<rootDir>/node_modules/",
  ],
};
