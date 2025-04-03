const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules\/web3/
      }
    ]
  },
  ignoreWarnings: [/Failed to parse source map/]
};