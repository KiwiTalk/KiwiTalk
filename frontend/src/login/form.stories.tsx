import { Story } from '@storybook/react';

import { LoginForm, LoginFormInput } from './form';

export default {
  title: 'KiwiTalk/login/LoginForm',
  component: LoginForm,
};

const Template: Story<Partial<LoginFormInput>> = (args) =>
  <LoginForm
    input={args}
    onSubmit={(input) => console.debug(input)}
  />;

export const Default = Template.bind({});
Default.args = {
  email: 'example@example.com',
  password: '1234',
  saveId: true,
  autoLogin: false,
};
