import { StoryFn } from '@storybook/react';

import { PasscodeForm } from './passcode';

export default {
  title: 'KiwiTalk/app/login/PasscodeForm',
  component: PasscodeForm,
  argTypes: {
    onSubmit: { action: 'Passcode' },
  },
};

const Template: StoryFn<typeof PasscodeForm> = (args) =>
  <PasscodeForm
    passcode={args.passcode}
    onSubmit={args.onSubmit}
  />;

export const Default = Template.bind({});
Default.args = {};

export const PreFilled = Template.bind({});
PreFilled.args = {
  passcode: '1234',
};
