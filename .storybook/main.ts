import type { StorybookConfig } from '@storybook/types';

const config: StorybookConfig = {
  stories: [
    '../frontend/src/**/*.stories.mdx',
    '../frontend/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
  features: {
    storyStoreV7: true,
  },
};
module.exports = config;
