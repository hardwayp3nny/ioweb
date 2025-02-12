const path = require('path');

module.exports = {
  entry: './src/worker.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'worker.js'
  }
};
