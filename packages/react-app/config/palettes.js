const requireYml = require('require-yml');
const paletteGenerator = require('@bobthered/tailwindcss-palette-generator');

const { colors: c } = requireYml('./branding.yml');

const colors = c.map(({ hex }) => hex);
const colorNames = c.map(({ name }) => name);
const palettes = paletteGenerator({ colors, colorNames });

module.exports = palettes;
