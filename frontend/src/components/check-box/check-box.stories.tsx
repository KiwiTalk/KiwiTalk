import { StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';

import { CheckBox } from '.';

export default {
  title: 'KiwiTalk/CheckBox',
  component: CheckBox,
  argTypes: {
    onInput: { action: 'Status' },
  },
};

type AdditionalProp = {
  label: string,
  checked?: boolean,
  indeterminate?: boolean,
}

const Template: StoryFn<ComponentProps<typeof CheckBox> & AdditionalProp> = (args) =>
  <CheckBox
    id="example"
    disabled={args.disabled}
    status={{ checked: args.checked, indeterminate: args.indeterminate }}
    onInput={args.onInput}
  >{args.label}</CheckBox>;

export const Default = Template.bind({});
Default.args = {
  label: 'Default Checkbox',
  checked: false,
  indeterminate: false,
  disabled: false,
};

export const Checked = Template.bind({});
Checked.args = {
  label: 'Checked Checkbox',
  checked: true,
  indeterminate: false,
  disabled: false,
};

export const Indeterminate = Template.bind({});
Indeterminate.args = {
  label: 'Indeterminate Checkbox',
  checked: false,
  indeterminate: true,
  disabled: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'Disabled Checkbox',
  checked: false,
  indeterminate: false,
  disabled: true,
};
