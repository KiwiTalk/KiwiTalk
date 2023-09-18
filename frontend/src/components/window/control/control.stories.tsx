import { StoryFn } from 'storybook-solidjs';

import { WindowControl, ControlType, ControlButtons } from '.';
import { styled } from '../../../utils';
import { background, color, control } from './control.stories.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';

export default {
  title: 'KiwiTalk/window/WindowControl',
  component: WindowControl,
  argTypes: {
    onControlClick: { action: 'Clicked' },
  },
};

type StoryProp = {
  background: string,
  color: string,
  showMinimizeButton: boolean,
  showMaximizeButton: boolean,
  showCloseButton: boolean,
  onControlClick?: (type: ControlType) => void
};

const Template: StoryFn<StoryProp> = (args) => {
  const buttons: ControlButtons = {
    minimize: args.showMinimizeButton,
    maximize: args.showMaximizeButton,
    close: args.showCloseButton,
  };

  const Control = styled(WindowControl, control);

  return <div style={assignInlineVars({
    [background]: args.background,
    [color]: args.color,
  })}>
    <Control buttons={buttons} onControlClick={args.onControlClick} />
  </div>;
};

export const Default = Template.bind({});
Default.args = {
  background: 'rgba(0, 0, 0, 0.1)',
  color: 'rgba(0, 0, 0, 0.5)',
  showMinimizeButton: true,
  showMaximizeButton: true,
  showCloseButton: true,
};
