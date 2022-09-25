import { ComponentStory } from '@storybook/react';

import { Button } from '.';

export default {
  title: 'KiwiTalk/components/Button',
  component: Button,
};

const Template: ComponentStory<typeof Button> = (args) =>
  <Button disabled={args.disabled}>
    {args.text}
  </Button>;

export const Default = Template.bind({});
Default.args = {
  text: 'Sample button',
  disabled: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  text: 'Disabled button',
  disabled: true,
};
