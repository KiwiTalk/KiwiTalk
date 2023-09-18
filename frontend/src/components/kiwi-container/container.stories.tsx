import { StoryFn } from 'storybook-solidjs';
import { KiwiContainer } from '.';
import { styled } from '../../utils';
import { backgroundColor, height, width, storyContainer } from '../../utils/story.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';

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
  const Container = styled(KiwiContainer, storyContainer);

  return <div
    style={assignInlineVars({
      [width]: `${args.width}px`,
      [height]: `${args.height}px`,
      [backgroundColor]: args.backgroundColor,
    })}
  >
    <Container />
  </div>;
};

export const Default = Template.bind({});
Default.args = {
  width: 640,
  height: 480,

  backgroundColor: 'rgb(225, 225, 225)',
};
