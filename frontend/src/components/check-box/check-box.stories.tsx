import { ComponentStory } from '@storybook/react';

import { CheckBox } from '.';

export default {
  title: 'KiwiTalk/CheckBox',
  component: CheckBox,
};

const Template: ComponentStory<typeof CheckBox> = (args) =>
  <CheckBox
    id="example"
    disabled={args.disabled}
    label={args.label}
    checked={args.checked}
    indeterminate={args.indeterminate}
  />;

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
