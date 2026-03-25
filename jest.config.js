const jestExpoPresets = require('jest-expo/jest-preset');

/** @type {import("jest").Config} **/
module.exports = {
    ...jestExpoPresets,
    preset: 'jest-expo',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
    testMatch: [
        '**/__tests__/**/*.?([mc])[jt]s?(x)',
        '**/?(*.)+(spec|test).?([mc])[jt]s?(x)',
        '!**/e2e/**/*.?([mc])[jt]s?(x)'
    ]
};
