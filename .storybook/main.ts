import type { StorybookConfig } from '@storybook/types';

export default {
  stories: [
    '../frontend/src/**/*.stories.mdx',
    '../frontend/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
  ],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
  features: {
    storyStoreV7: true,
  },
} satisfies StorybookConfig;
