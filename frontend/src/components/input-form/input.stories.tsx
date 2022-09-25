import { ComponentStory } from '@storybook/react';

import { InputForm } from '.';

export default {
  title: 'KiwiTalk/components/InputForm',
  component: InputForm,
};

const Template: ComponentStory<typeof InputForm> = (args) =>
  <InputForm
    icon={args.icon}
    disabled={args.disabled}
    input={args.input}
  />;

export const Default = Template.bind({});
Default.args = {
  icon: 'account_circle',
  disabled: false,
  input: {
    defaultValue: 'Sample input',
    placeholder: 'Placeholder',
  },
};

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  disabled: false,
  input: {
    defaultValue: 'Sample input',
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
    defaultValue: 'Disabled input',
    placeholder: 'Placeholder',
  },
};
