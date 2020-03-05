const withCSS = require('@zeit/next-css');
const webpack = require('webpack');
const path = require('path');
require('dotenv').config();

module.exports = withCSS({
  webpack: config => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    });

    config.node = {
      fs: 'empty',
    };

    const env = Object.keys(process.env).reduce((acc, curr) => {
      acc[`process.env.${curr}`] = JSON.stringify(process.env[curr]);
      return acc;
    }, {});
    config.plugins.push(new webpack.DefinePlugin(env));
    config.resolve.modules.push(path.resolve('./'));
    return config;
  },
});
