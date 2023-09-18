import { StoryFn } from 'storybook-solidjs';

import { DeviceRegisterForm } from './device-register';

export default {
  title: 'KiwiTalk/app/login/DeviceRegisterForm',
  component: DeviceRegisterForm,
  argTypes: {
    onSubmit: { action: 'RegisterType' },
  },
};

const Template: StoryFn<typeof DeviceRegisterForm> = (args) =>
  <DeviceRegisterForm
    onSubmit={args.onSubmit}
  />;

export const Default = Template.bind({});
Default.args = {};
