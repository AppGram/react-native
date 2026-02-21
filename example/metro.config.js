const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');
const exampleNodeModules = path.resolve(__dirname, 'node_modules');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root],
  resolver: {
    // Ensure SDK uses example app's react and react-native
    extraNodeModules: {
      '@appgram/react-native': root,
      'react': path.resolve(exampleNodeModules, 'react'),
      'react-native': path.resolve(exampleNodeModules, 'react-native'),
    },
    // Block resolving react/react-native from parent directory
    blockList: [
      new RegExp(`${root}/node_modules/react/.*`),
      new RegExp(`${root}/node_modules/react-native/.*`),
    ],
    nodeModulesPaths: [exampleNodeModules],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
