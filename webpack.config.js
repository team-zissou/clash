var path = require('path');

module.exports = {
  entry: {
    bundle: './src/index'
  },
  output: {
    path: path.join(__dirname, 'static'),
    filename: '[name].js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: path.join(__dirname, 'src')
    }]
  }
};
