import { ComponentStory } from '@storybook/react';

import { InputForm } from '.';

export default {
  title: 'KiwiTalk/InputForm',
  component: InputForm,
};

const Template: ComponentStory<typeof InputForm> = (args) =>
  <InputForm
    icon={args.icon}
    disabled={args.disabled}
    input={args.input}
  />;

export const Primary = Template.bind({});
Primary.args = {
  icon: 'account_circle',
  disabled: false,
  input: {
    value: 'Sample input',
    placeholder: 'Placeholder',
  },
};
