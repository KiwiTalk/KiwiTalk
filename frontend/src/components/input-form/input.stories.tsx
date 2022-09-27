import { ComponentStory } from '@storybook/react';

import { InputForm } from '.';

export default {
  title: 'KiwiTalk/components/InputForm',
  component: InputForm,
  argTypes: {
    onChange: { action: 'Input' },
  },
};

const Template: ComponentStory<typeof InputForm> = (args) =>
  <InputForm
    icon={args.icon}
    disabled={args.disabled}
    defaultValue={args.defaultValue}
    placeholder={args.placeholder}
    onChange={args.onChange}
  />;

export const Default = Template.bind({});
Default.args = {
  icon: 'account_circle',
  disabled: false,
  defaultValue: 'Sample input',
  placeholder: 'Placeholder',
};

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  disabled: false,
  defaultValue: 'Sample input',
  placeholder: 'Placeholder',
};

export const Placeholder = Template.bind({});
Placeholder.args = {
  icon: 'account_circle',
  disabled: false,
  placeholder: 'Placeholder',
};

export const Disabled = Template.bind({});
Disabled.args = {
  icon: 'account_circle',
  disabled: true,
  defaultValue: 'Disabled input',
  placeholder: 'Placeholder',
};
