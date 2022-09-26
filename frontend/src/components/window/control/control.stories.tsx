import { Story } from '@storybook/react';
import styled from 'styled-components';

import { WindowControl } from '.';

export default {
  title: 'KiwiTalk/components/window/WindowControl',
  component: WindowControl,
};

type StoryProp = {
  background: string,
  color: string
};

const Template: Story<StoryProp> = (args) => {
  const Control = styled(WindowControl)`
    background: ${args.background};
    color: ${args.color};
  `;

  return <Control
    onControlClick={(type) => {
      console.debug('Clicked ' + type);
    }}
  />;
};

export const Default = Template.bind({});
Default.args = {
  background: 'rgba(0, 0, 0, 0.1)',
  color: 'rgba(0, 0, 0, 0.5)',
};
