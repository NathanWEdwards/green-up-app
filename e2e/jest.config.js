/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    moduleNameMapper: {
        '@/(.*)$': '<rootDir>/$1'
    },
    rootDir: '..',
    testMatch: ['<rootDir>/e2e/**/*.test.js'],
    testTimeout: 120000,
    maxWorkers: 1,
    globalSetup: 'detox/runners/jest/globalSetup',
    globalTeardown: 'detox/runners/jest/globalTeardown',
    reporters: ['detox/runners/jest/reporter'],
    testEnvironment: 'detox/runners/jest/testEnvironment',
    verbose: true,
    setupFiles: ['<rootDir>/e2e/jest.setup-env.js']
};
