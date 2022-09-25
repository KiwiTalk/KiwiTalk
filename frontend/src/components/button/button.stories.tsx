import { ComponentStory } from '@storybook/react';

import { Button } from '.';

export default {
  title: 'KiwiTalk/Button',
  component: Button,
};

const Template: ComponentStory<typeof Button> = (args) =>
  <Button disabled={args.disabled}>
    {args.text}
  </Button>;

export const Primary = Template.bind({});
Primary.args = {
  text: 'Sample button',
  disabled: false,
};
