/* eslint-disable */

const webpack = require('webpack');
require('dotenv').config();

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { i18n } = require('./next-i18next.config');
const path = require('path');
import { NextConfig } from 'next';
import { Configuration } from 'webpack';

const nextConfig: NextConfig = withBundleAnalyzer({
  turbopack: {
    root: path.join(__dirname, '..'),
    rules: {
      '*.{graphql,gql}': {
        loaders: ['graphql-tag/loader'],
        exclude: /node_modules/,
        as: '*.js',
      },
    },
    env: {
      GRAPHQL_URI: process.env.NEXT_PUBLIC_GRAPHQL_URI,
    },
  },
  webpack: (config: Configuration) => {
    const env = Object.keys(process.env).reduce((acc, curr) => {
      acc[`process.env.${curr}`] = JSON.stringify(process.env[curr]);
      return acc;
    }, {} as Record<string, string>);

    config.plugins?.push(new webpack.DefinePlugin(env));

    config.module?.rules?.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    });

    return config;
  },
  i18n,
  trailingSlash: true,
  outputFileTracingRoot: undefined,
  experimental: {
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
    serverSourceMaps: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
});

export default nextConfig;
