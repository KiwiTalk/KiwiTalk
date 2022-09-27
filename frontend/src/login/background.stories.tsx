import { Story } from '@storybook/react';
import styled from 'styled-components';

import { LoginBackground } from './background';

export default {
  title: 'KiwiTalk/login/LoginBackground',
  component: LoginBackground,
};

type BackgroundProp = {
  width: number;
  height: number;
};

const Template: Story<BackgroundProp> = (args) => {
  const Background = styled(LoginBackground)`
    width: ${args.width}px;
    height: ${args.height}px;
    border: 1px solid #000000;
  `;

  return <Background/>;
};

export const Pc = Template.bind({});
Pc.args = {
  width: 1280,
  height: 720,
};

export const Mobile = Template.bind({});
Mobile.args = {
  width: 1080,
  height: 1920,
};
