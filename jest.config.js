
const jestExpoPresets  = require('jest-expo/jest-preset');


/** @type {import("jest").Config} **/
module.exports = {
  ...jestExpoPresets,
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
  "/node_modules/(?!(expo.*|@?firebase.*|jest.*|@?react.*)/).*/"
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "json", "jsx", "node"],
};