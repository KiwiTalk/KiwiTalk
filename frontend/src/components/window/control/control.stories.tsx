import { ComponentStory } from '@storybook/react';
import styled from 'styled-components';

import { WindowControl } from '.';

export default {
  title: 'KiwiTalk/components/window/WindowControl',
  component: WindowControl,
};

const DimmedWindowControl = styled(WindowControl)`
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.5);
`;

const Template: ComponentStory<typeof WindowControl> = (args) =>
  <DimmedWindowControl onControlClick={args.onControlClick}/>;

export const Default = Template.bind({});
Default.args = {
  onControlClick: (type) => {
    console.debug('Clicked ' + type);
  },
};
