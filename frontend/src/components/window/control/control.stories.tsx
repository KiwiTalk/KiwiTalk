import { StoryFn } from '@storybook/react';
import styled from 'styled-components';

import { WindowControl, ControlType, ControlButtons } from '.';

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

  const Control = styled(WindowControl)`
    background: ${args.background};
    color: ${args.color};
  `;

  return <Control buttons={buttons} onControlClick={args.onControlClick} />;
};

export const Default = Template.bind({});
Default.args = {
  background: 'rgba(0, 0, 0, 0.1)',
  color: 'rgba(0, 0, 0, 0.5)',
  showMinimizeButton: true,
  showMaximizeButton: true,
  showCloseButton: true,
};
