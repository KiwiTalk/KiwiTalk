import { StoryFn } from 'storybook-solidjs';

import { Button } from '.';
import { ComponentProps } from 'solid-js';

export default {
  title: 'KiwiTalk/Button',
  component: Button,
  argTypes: {
    onClick: { action: 'Clicked' },
  },
};

const Template: StoryFn<ComponentProps<typeof Button> & { text: string }> = (args) =>
  <Button disabled={args.disabled} onClick={args.onClick}>
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
