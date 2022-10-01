import { ComponentStory } from '@storybook/react';

import { ReactComponent as IconAccountCircle } from './account_circle.svg';

import { InputForm } from '.';

export default {
  title: 'KiwiTalk/components/InputForm',
  component: InputForm,
  argTypes: {
    onInput: { action: 'Input' },
  },
};

const Template: ComponentStory<typeof InputForm> = (args) =>
  <InputForm
    icon={args.icon}
    disabled={args.disabled}
    defaultValue={args.defaultValue}
    placeholder={args.placeholder}
    onInput={args.onInput}
  />;

export const Default = Template.bind({});
Default.args = {
  icon: <IconAccountCircle />,
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
  icon: <IconAccountCircle />,
  disabled: false,
  placeholder: 'Placeholder',
};

export const Disabled = Template.bind({});
Disabled.args = {
  icon: <IconAccountCircle />,
  disabled: true,
  defaultValue: 'Disabled input',
  placeholder: 'Placeholder',
};
