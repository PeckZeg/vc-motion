const path = require('path');

module.exports = {
  setupFiles: ['./tests/setup.js'],
  testEnvironment: 'jsdom',
  preset: 'ts-jest',

  transform: {
    '^.+\\.(js|ts)x$': [
      'babel-jest',
      {
        configFile: path.join(__dirname, 'babel.test.config.js')
      }
    ]
  },

  globals: {
    'ts-jest': {
      tsConfig: path.join(__dirname, 'tsconfig.test.json')
    }
  }
};
