import { StoryFn } from 'storybook-solidjs';

import { assignInlineVars } from '@vanilla-extract/dynamic';

import { LoginContainer } from './container';
import { styled } from '../../utils';
import { storyContainer, width, height } from '../../utils/story.css';

export default {
  title: 'KiwiTalk/login/LoginContainer',
  component: LoginContainer,
};

type BackgroundProp = {
  width: number;
  height: number;
};

const Template: StoryFn<BackgroundProp> = (args) => {
  const Container = styled(LoginContainer, storyContainer);

  return <div
    style={assignInlineVars({
      [width]: `${args.width}px`,
      [height]: `${args.height}px`,
    })}
  >
    <Container />
  </div>;
};

export const PcW16H9 = Template.bind({});
PcW16H9.args = {
  width: 1920,
  height: 1080,
};

export const PcW5H4 = Template.bind({});
PcW5H4.args = {
  width: 1280,
  height: 1024,
};

export const Windowed = Template.bind({});
Windowed.args = {
  width: 1280,
  height: 720,
};

export const Mobile = Template.bind({});
Mobile.args = {
  width: 1080,
  height: 1920,
};
