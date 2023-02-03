import { StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { KiwiContainer } from '.';

export default {
  title: 'KiwiTalk/KiwiContainer',
  component: KiwiContainer,
};

type StoryProp = {
  width: number,
  height: number,
  backgroundColor: string,
};

const Template: StoryFn<StoryProp> = (args) => {
  const Container = styled(KiwiContainer)`
    width: ${args.width}px;
    height: ${args.height}px;
    background-color: ${args.backgroundColor};

    border: 1px solid #000000;
  `;

  return <Container />;
};

export const Default = Template.bind({});
Default.args = {
  width: 640,
  height: 480,

  backgroundColor: 'rgb(225, 225, 225)',
};
