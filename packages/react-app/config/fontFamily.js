const requireYml = require('require-yml');
const { keyBy, mapValues } = require('lodash');

const branding = requireYml('./branding.yml');

const fontFamily = mapValues(
  keyBy(branding.fontFamily, ({ key }) => key),
  ({ values }) => values,
);

module.exports = fontFamily;
