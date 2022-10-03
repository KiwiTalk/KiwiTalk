import { Story } from '@storybook/react';

import { LoginForm, LoginFormInput } from './login';

export default {
  title: 'KiwiTalk/app/login/LoginForm',
  component: LoginForm,
  argTypes: {
    onSubmit: { action: 'Login' },
  },
};

type Prop = Partial<LoginFormInput> & {
  onSubmit?: (input: LoginFormInput) => void,
};

const Template: Story<Prop> = (args) =>
  <LoginForm
    input={args}
    onSubmit={args.onSubmit}
  />;

export const Default = Template.bind({});
Default.args = {
  email: 'example@example.com',
  password: '1234',
  saveId: true,
  autoLogin: false,
};
