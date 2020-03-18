const withCSS = require('@zeit/next-css');
const withLess = require('@zeit/next-less');
const webpack = require('webpack');
const path = require('path');
require('dotenv').config();

if (typeof require !== 'undefined') {
  require.extensions['.less'] = file => {};
}

module.exports = withLess(
  withCSS({
    env: {
      GRAPHQL_URI: process.env.GRAPHQL_URI,
    },
    lessLoaderOptions: { javascriptEnabled: true },
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
  }),
);
