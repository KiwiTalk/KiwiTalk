import { ComponentStory } from '@storybook/react';

import { DeviceRegisterForm } from './device-register';

export default {
  title: 'KiwiTalk/login/DeviceRegisterForm',
  component: DeviceRegisterForm,
  argTypes: {
    onSubmit: { action: 'RegisterType' },
  },
};

const Template: ComponentStory<typeof DeviceRegisterForm> = (args) =>
  <DeviceRegisterForm
    onSubmit={args.onSubmit}
  />;

export const Default = Template.bind({});
Default.args = {};
