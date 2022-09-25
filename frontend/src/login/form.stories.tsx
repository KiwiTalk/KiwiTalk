import { ComponentStory } from '@storybook/react';

import { LoginForm } from './form';

export default {
  title: 'KiwiTalk/login/LoginForm',
  component: LoginForm,
};

const Template: ComponentStory<typeof LoginForm> = (args) =>
  <LoginForm
    email={args.email}
    password={args.password}
    saveId={args.saveId}
    autoLogin={args.autoLogin}
  />;

export const Default = Template.bind({});
Default.args = {
  email: 'example@example.com',
  password: '1234',
  saveId: true,
  autoLogin: false,
};
