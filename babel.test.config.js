module.exports = require('@ayase/ayase-build/lib/getBabelConfig').default({
  target: 'browser',
  type: 'cjs',
  typescript: true,
  runtimeHelpers: true
}).opts;
