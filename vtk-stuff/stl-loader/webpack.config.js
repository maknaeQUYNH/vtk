//webpack.config.js

const path = require("path")

module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
  entry : {
  stlloader: './src/STLloader.js',
  contour: './src/index-cplot.js',
  glyph: './src/index-Glyph.js',
  },
  output : {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js'
  },
};


