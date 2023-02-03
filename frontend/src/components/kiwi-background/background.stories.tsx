import { StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { KiwiBackground } from '.';

export default {
  title: 'KiwiTalk/KiwiBackground',
  component: KiwiBackground,
};

type StoryProp = {
  width: number,
  height: number,
  backgroundColor: string,
};

const Template: StoryFn<StoryProp> = (args) => {
  const Background = styled(KiwiBackground)`
    width: ${args.width}px;
    height: ${args.height}px;
    background-color: ${args.backgroundColor};

    border: 1px solid #000000;
  `;

  return <Background />;
};

export const Default = Template.bind({});
Default.args = {
  width: 640,
  height: 480,

  backgroundColor: 'rgb(225, 225, 225)',
};
