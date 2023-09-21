import { StoryFn } from 'storybook-solidjs';

import IconAccountCircle from './account_circle.svg';

import { InputForm } from '.';

export default {
  title: 'KiwiTalk/InputForm',
  component: InputForm,
  argTypes: {
    onInput: { action: 'Input' },
  },
};

const Template: StoryFn<typeof InputForm> = (args) =>
  <InputForm
    icon={args.icon}
    disabled={args.disabled}
    value={args.value}
    placeholder={args.placeholder}
    onInput={args.onInput}
  />;

export const Default = Template.bind({});
Default.args = {
  icon: <IconAccountCircle />,
  disabled: false,
  value: 'Sample input',
  placeholder: 'Placeholder',
};

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  disabled: false,
  value: 'Sample input',
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
  value: 'Disabled input',
  placeholder: 'Placeholder',
};
