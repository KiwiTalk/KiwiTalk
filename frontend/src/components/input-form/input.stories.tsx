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

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  disabled: false,
  input: {
    value: 'Sample input',
    placeholder: 'Placeholder',
  },
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  icon: 'account_circle',
  disabled: false,
  input: {
    placeholder: 'Placeholder',
  },
};

export const Disabled = Template.bind({});
Disabled.args = {
  icon: 'account_circle',
  disabled: true,
  input: {
    value: 'Disabled input',
    placeholder: 'Placeholder',
  },
};
