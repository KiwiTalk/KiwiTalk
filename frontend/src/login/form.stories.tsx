import { ComponentStory } from '@storybook/react';

import { LoginForm } from './form';

export default {
  title: 'KiwiTalk/login/LoginForm',
  component: LoginForm,
};

const Template: ComponentStory<typeof LoginForm> = (args) =>
  <LoginForm
    input={args.input}
    onSubmit={(input) => console.log(input)}
  />;

export const Default = Template.bind({});
Default.args = {
  input: {
    email: 'example@example.com',
    password: '1234',
    saveId: true,
    autoLogin: false,
  },
};
