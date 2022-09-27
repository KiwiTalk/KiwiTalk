import { Story } from '@storybook/react';

import { MaterialIconRound } from '.';

export default {
  title: 'KiwiTalk/components/MaterialIconRound',
  component: MaterialIconRound,
};

type IconProp = {
  icon: string,
};

const Template: Story<IconProp> = (args) =>
  <MaterialIconRound>{args.icon}</MaterialIconRound>;

export const Default = Template.bind({});
Default.args = {
  icon: 'account_circle',
};
