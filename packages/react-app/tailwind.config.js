const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');
const typography = require('@tailwindcss/typography');

const { forEach, reduce, set } = require('lodash');

const extensions = require('./config/extensions');
const fontFamily = require('./config/fontFamily');
const palettes = require('./config/palettes');

module.exports = {
  mode: 'jit',
  purge: [
    './public/**/*.html',
    `./src/**/*.{${extensions.join(',')}}`,
  ],
  darkMode: 'media',
  theme: {
    colors: {
      transparent: 'transparent',
      white: colors.white,
      black: colors.black,
      gray: colors.gray,
      coolGray: colors.coolGray,
      warmGray: colors.warmGray,
      blue: colors.blue,
      green: colors.green,
      red: colors.red,
      yellow: colors.yellow,
      ...palettes,
    },
    extend: {
      blur: {
        xs: '2px',
      },
      fontFamily: fontFamily,
      spacing: {
        // add key/values for negative values
        ...reduce(defaultTheme.spacing, (result, v, k) => ({
          ...result, [`-${k}`]: `-${v}`,
        }), {})
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {},
        },
      }),
    },
    screens: () => {

      // Example output:
      // {
      //   xs: { max },
      //   'sm>': { min },
      //   sm: { min, max },
      //   '<sm': { max },
      //   'md>': { min },
      //   md: { min, max },
      //   '<md': { max },
      //   'lg>': { min },
      //   lg: { min, max },
      //   '<lg': { max },
      //   xl: { min }
      // }

      const breakpoints = [
        ['xs', 0],
        ['sm', 600],
        ['md', 900],
        ['lg', 1200],
        ['xl', 1800],
      ];

      const screens = {};

      forEach(breakpoints, (b, i) => {
        const next = breakpoints[i + 1];
        const nextMin = next ? next[next.length - 1] : 10000;

        const key = b[0];
        const min = `${b[1]}px`;
        const max = `${nextMin - 1}px`;

        if (i === 0) {
          return set(screens, `${key}.max`, max);
        }

        if (i === breakpoints.length - 1) {
          return set(screens, `${key}.min`, min);
        }

        set(screens, `${key}>.min`, min);
        set(screens, `${key}.min`, min);
        set(screens, `${key}.max`, max);
        set(screens, `<${key}.max`, max);
      });

      return screens;
    },
  },
  plugins: [
    typography(),
  ],
}
