import { StoryFn } from 'storybook-solidjs';

import { CheckBox } from '.';
import { ComponentProps } from 'solid-js';

export default {
  title: 'KiwiTalk/CheckBox',
  component: CheckBox,
  argTypes: {
    onInput: { action: 'Status' },
  },
};

type AdditionalProps = {
  label: string,
  checked?: boolean,
  indeterminate?: boolean,
}

const Template: StoryFn<ComponentProps<typeof CheckBox> & AdditionalProps> = (args) =>
  <CheckBox
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
