/* eslint-disable */

const withCSS = require('@zeit/next-css');
const withLess = require('@zeit/next-less');
const withFonts = require('next-fonts');
const webpack = require('webpack');
const path = require('path');
const darkTheme = require('@ant-design/dark-theme').default;
require('dotenv').config();

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

if (typeof require !== 'undefined') {
  require.extensions['.less'] = (file) => {};
}

module.exports = withBundleAnalyzer(
  withFonts(
    withLess(
      withCSS({
        env: {
          GRAPHQL_URI: process.env.GRAPHQL_URI,
          GA_TRACKING_ID: process.env.GA_TRACKING_ID,
        },
        lessLoaderOptions: {
          javascriptEnabled: true,
          modifyVars: darkTheme,
        },
        webpack: (config, { isServer }) => {
          if (isServer) {
            const antStyles = /antd\/.*?\/style.*?/;
            const origExternals = [...config.externals];
            config.externals = [
              (context, request, callback) => {
                if (request.match(antStyles)) return callback();
                if (typeof origExternals[0] === 'function') {
                  origExternals[0](context, request, callback);
                } else {
                  callback();
                }
              },
              ...(typeof origExternals[0] === 'function' ? [] : origExternals),
            ];

            config.module.rules.unshift({
              test: antStyles,
              use: 'null-loader',
            });
          }
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
          return config;
        },
      }),
    ),
  ),
);
