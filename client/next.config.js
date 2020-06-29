/* eslint-disable */

const withCSS = require('@zeit/next-css');
const withLess = require('@zeit/next-less');
const withSass = require('@zeit/next-sass');
const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules');
const withFonts = require('next-fonts');
const webpack = require('webpack');
const path = require('path');
const darkTheme = require('@ant-design/dark-theme').default;
const generateTheme = require('next-dynamic-antd-theme/plugin');
const cssLoaderGetLocalIdent = require('css-loader/lib/getLocalIdent.js');

require('dotenv').config();

const prod = process.env.NODE_ENV === 'production';
const prefix = prod ? '/next-dynamic-antd-theme/' : '/';

const withAntdTheme = generateTheme({
  antDir: path.join(__dirname, './node_modules/antd'),
  stylesDir: path.join(__dirname, './theme'),
  varFile: path.join(__dirname, './theme/vars.less'),
  outputFilePath: path.join(__dirname, './.next/static/color.less'),
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withAntd = (nextConfig = {}) => {
  return {
    ...nextConfig,
    env: {
      GRAPHQL_URI: process.env.GRAPHQL_URI,
      GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    },
    lessLoaderOptions: {
      javascriptEnabled: true,
    },
    cssModules: true,
    cssLoaderOptions: {
      camelCase: true,
      localIdentName: '[local]___[hash:base64:5]',
      getLocalIdent: (context, localIdentName, localName, options) => {
        let hz = context.resourcePath.replace(context.rootContext, '');
        if (/node_modules/.test(hz)) {
          return localName;
        } else {
          return cssLoaderGetLocalIdent(
            context,
            localIdentName,
            localName,
            options,
          );
        }
      },
    },
    webpack(config, options) {
      if (config.externals) {
        const includes = [/antd/];
        config.externals = config.externals.map((external) => {
          if (typeof external !== 'function') return external;
          return (ctx, req, cb) => {
            return includes.find((include) =>
              req.startsWith('.')
                ? include.test(path.resolve(ctx, req))
                : include.test(req),
            )
              ? cb()
              : external(ctx, req, cb);
          };
        });
      }

      config.module.rules.push({
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      });

      return typeof nextConfig.webpack === 'function'
        ? nextConfig.webpack(config, options)
        : config;
    },
  };
};

module.exports = withPlugins(
  [withAntd, withLess, withTM, withSass, withCSS, withAntdTheme],
  {
    serverRuntimeConfig: {},
    publicRuntimeConfig: { prefix },
    assetPrefix: prefix,
    webpack: (config, options) => {
      // config.node = { fs: 'empty' };
      return config;
    },
  },
);
