module.exports = {
    // Use jsdom for DOM APIs in tests
    testEnvironment: 'jsdom',

    // Transform JS files with Babel
    transform: {
        '^.+\\.m?js$': 'babel-jest',
    },

    // Recognize these file extensions
    moduleFileExtensions: ['js', 'mjs', 'json', 'node'],

    // Show individual test results
    verbose: true,

    // Map static assets to mocks so imports don't break
    moduleNameMapper: {
        '\\.css$': '<rootDir>/tests/__mocks__/styles-mock.js',
        '\\.html$': '<rootDir>/tests/__mocks__/html-mock.js',
        '\\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$': '<rootDir>/tests/__mocks__/file-system-mock.js',
    },

    // Optional: automatically reset modules and clear mocks between tests
    resetMocks: true,
    clearMocks: true,
};
