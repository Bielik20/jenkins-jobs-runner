import { resolve } from 'path';
import sourceMaps from 'rollup-plugin-sourcemaps';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import { getIfUtils, removeEmpty } from 'webpack-config-utils';

import pkg from '../package.json';
const {
  pascalCase,
  normalizePackageName,
  getOutputFileName,
} = require('./helpers');

/**
 * @typedef {import('./types').RollupConfig} Config
 */
/**
 * @typedef {import('./types').RollupPlugin} Plugin
 */

const env = process.env.NODE_ENV || 'development';
const { ifProduction } = getIfUtils(env);

const LIB_NAME = pascalCase(normalizePackageName(pkg.name));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

/**
 * Object literals are open-ended for js checking, so we need to be explicit
 * @type {{entry:{esm5: string, esm2015: string},bundles:string}}
 */
const PATHS = {
  entry: {
    esm5: resolve(DIST, 'esm5'),
    esm2015: resolve(DIST, 'esm2015'),
  },
  bundles: resolve(DIST, 'bundles'),
};

/**
 *  @type {Plugin[]}
 */
const plugins = /** @type {Plugin[]} */ ([
  // Allow json resolution
  json(),

  // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
  commonjs(),

  // Resolve source maps to the original source
  sourceMaps(),

  // properly set process.env.NODE_ENV within `./environment.ts`
  replace({
    exclude: 'node_modules/**',
    'process.env.NODE_ENV': JSON.stringify(env),
  }),
]);

/**
 * @type {Config}
 */
const CommonConfig = {
  input: {},
  output: {},
  inlineDynamicImports: true,
};

/**
 * @type {Config}
 */
const UMDconfig = {
  ...CommonConfig,
  input: resolve(PATHS.entry.esm5, 'index.js'),
  output: {
    file: getOutputFileName(
      resolve(PATHS.bundles, 'index.umd.js'),
      ifProduction(),
    ),
    format: 'umd',
    name: LIB_NAME,
    sourcemap: true,
  },
  plugins: removeEmpty(
    /** @type {Plugin[]} */ ([...plugins, ifProduction(uglify())]),
  ),
};

export default [UMDconfig];
