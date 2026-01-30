const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const vssExtension = require('./vss-extension.json');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    entry: './src/main.tsx',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        '__APP_VERSION__': JSON.stringify(vssExtension.version),
        '__DEV_MODE__': JSON.stringify(isDev)
      }),
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'images', to: 'images', noErrorOnMissing: true }
        ]
      })
    ],
    devServer: {
      static: './dist',
      hot: true,
      port: 3000
    },
    devtool: isDev ? 'eval-source-map' : 'source-map'
  };
};
