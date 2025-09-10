/* eslint-disable */

const webpack = require('webpack');
require('dotenv').config();

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { i18n } = require('./next-i18next.config');

const path = require('path');

module.exports = withBundleAnalyzer({
  turbopack: {
    root: path.join(__dirname, '..'),
    rules: {
      '*.{graphql,gql}': {
        loaders: ['graphql-tag/loader'],
        exclude: /node_modules/,
        as: '*.js',
      },
    },
  },
  webpack: (config) => {
    const env = Object.keys(process.env).reduce((acc, curr) => {
      acc[`process.env.${curr}`] = JSON.stringify(process.env[curr]);
      return acc;
    }, {});

    config.plugins.push(new webpack.DefinePlugin(env));

    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    });

    return config;
  },
  i18n,
  trailingSlash: true,
  experimental: {
    // Enable better debugging support
    outputFileTracingRoot: undefined,
  },
});
