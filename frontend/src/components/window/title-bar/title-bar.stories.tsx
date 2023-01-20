import { StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { WindowTitleBar } from '.';
import { WindowControl } from '../control';

export default {
  title: 'KiwiTalk/window/WindowTitleBar',
  component: WindowTitleBar,
  argTypes: {},
};

const TitleBar = styled(WindowTitleBar)`
  display: flex;
  outline: 1px solid black;
  font-size: 0.8em;
  height: 20px;
`;

const TitleBarControl = styled(WindowControl)`
  color: rgba(0, 0, 0, 0.5);
  margin-left: auto;
`;

const TitleBarTitle = styled.span`
  padding: 0px 0.5rem;
  user-select: none;
`;

const Template: StoryFn<typeof WindowTitleBar> = () => {
  return <TitleBar>
    <TitleBarTitle>Sample title</TitleBarTitle>
    <TitleBarControl />
  </TitleBar>;
};

export const Default = Template.bind({});
Default.args = {};
