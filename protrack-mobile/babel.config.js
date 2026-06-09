module.exports = function (api) {
  api.cache(true);
  const isProd = process.env.NODE_ENV === 'production';
  return {
    presets: [
      ['babel-preset-expo', { unstable_transformImportMeta: true }]
    ],
    plugins: [
      'react-native-reanimated/plugin',
      ...(isProd ? ['transform-remove-console'] : []),
    ],
  };
};
