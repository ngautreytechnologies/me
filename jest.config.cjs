module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.m?js$': 'babel-jest'
    },
    moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
    verbose: true,
    moduleNameMapper: {
        '\\.css$': '<rootDir>/tests/__mocks__/styles-mock.js',
        '\\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$': '<rootDir>/tests/__mocks__/file-system-mock.js'
    }
};
