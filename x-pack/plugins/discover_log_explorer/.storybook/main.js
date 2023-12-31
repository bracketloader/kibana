/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

const defaultConfig = require('@kbn/storybook').defaultConfig;

module.exports = {
  ...defaultConfig,
  stories: ['../**/*.stories.mdx', ...defaultConfig.stories],
  webpackFinal: async (config) => {
    const originalConfig = await defaultConfig.webpackFinal(config);

    // Mock fleet plugin for PackageIcon component
    originalConfig.resolve.alias['@kbn/fleet-plugin/public'] = require.resolve(
      './__mocks__/package_icon'
    );
    return originalConfig;
  },
};
