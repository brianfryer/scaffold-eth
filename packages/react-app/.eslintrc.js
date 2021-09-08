module.exports = {
  extends: ['airbnb', 'airbnb/hooks'],
  env: {
    browser: true,
  },
  globals: {
    __PATH_PREFIX__: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    babelOptions: {
      presets: ['@babel/preset-react']
    },
    ecmaVersion: 2020,
    requireConfigFile: false,
  },
  rules: {
    'no-underscore-dangle': 'off',
    'no-unused-vars': 'warn',
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'warn',
  },
  // settings: {
  //   'import/resolver': {
  //     'babel-module': {
  //       root: ['./src'],
  //       alias: {
  //         '~': './src',
  //       },
  //     },
  //   },
  // },
};
