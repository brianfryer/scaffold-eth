const { when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES } = require('@craco/craco');

const autoprefixer = require('autoprefixer');
const globImporter = require('node-sass-glob-importer');
const LastCallWebpackPlugin = require('last-call-webpack-plugin');
const path = require('path');
const postcss = require('postcss');
const postcssCombineDuplicatedSelectors = require('postcss-combine-duplicated-selectors');
const postcssCombineMediaQuery = require('postcss-combine-media-query');
const postcssImport = require('postcss-import');
const postcssInlineSvg = require('postcss-inline-svg');
const tailwindcss = require('tailwindcss');
const yamlImporter = require('node-sass-yaml-importer');

module.exports = {
  reactScriptsVersion: 'react-scripts',
  style: {
    modules: {
      localIdentName: '',
    },
    css: {
      loaderOptions: (cssLoaderOptions, { env, paths }) => {
        return {
          ...cssLoaderOptions,
          modules: {
            localIdentName: whenProd
              ? '[sha1:hash:hex:5]'
              : '[name]__[local]--[hash:base64:5]',
            namedExport: false,
          },
          sourceMap: true,
        };
      },
    },
    sass: {
      loaderOptions: {
        sassOptions: {
          importer: [yamlImporter, globImporter()],
          includePaths: [
            'src',
            'src/styles',
            'node_modules',
          ],
          outputStyle: 'expanded',
          sourceComments: false,
        },
        sourceMap: true,
      },
    },
    postcss: {
      plugins: [
        tailwindcss,
        postcssImport,
        postcssInlineSvg,
        autoprefixer,
      ],
    },
  },
  webpack: {
    alias: {
      '~': path.resolve(process.cwd(), 'src'),
    },
    plugins: {
      add: [
        new LastCallWebpackPlugin({
          assetProcessors: [{
            regExp: /\.css$/,
            processor: (name, asset) => console.log(name) ||
              postcss([
                postcssCombineDuplicatedSelectors({
                  removeDuplicatedProperties: true,
                }),
                postcssCombineMediaQuery(),
              ])
              .process(asset.source())
              .then((result) => result.css),
          }],
        }),
      ],
    },
  },
};
