const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
  entry: {
    bundle: ['./src/export.js']
  },
  resolve: {
    extensions: ['.mjs', '.js', '.svelte']
  },
  output: {
    path: __dirname + '/firefox',
    filename: '[name].js',
    chunkFilename: '[name].[id].js'
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            hotReload: true
          }
        }
      },
      {
        test: /\.css$/,
        use: [
					/**
					 * MiniCssExtractPlugin doesn't support HMR.
					 * For developing, use 'style-loader' instead.
					 * */
          prod ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader'
        ]
      },
      // {
      //   test: /\.js$/,
      //   loader: "transform-loader?brfs"
      // }
    ]
  },
  mode,
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new webpack.EnvironmentPlugin({
      'ORBS_NODE_ADDRESS': process.env.ORBS_NODE_ADDRESS,
      'ORBS_VCHAIN': process.env.ORBS_VCHAIN,
      'ORBS_PRISM_URL': process.env.ORBS_PRISM_URL,
      'ORBS_ERC721': process.env.ORBS_ERC721,
      'ORBS_PROVENANCE': process.env.ORBS_PROVENANCE,
      'ORBS_NAMES': process.env.ORBS_NAMES
    })
  ],
  devtool: prod ? false : 'source-map'
};
