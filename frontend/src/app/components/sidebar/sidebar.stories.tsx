import { StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { Sidebar } from '.';

export default {
  title: 'KiwiTalk/app/Sidebar',
  component: Sidebar,
  argTypes: {
    onMenuSelect: { action: 'MenuItem' },
    onButtonClick: { action: 'ButtonItem' },
  },
};

const PreviewSidebar = styled(Sidebar)`
  border: solid black 1px;

  height: 720px;
`;

const Template: StoryFn<typeof Sidebar> = (args) =>
  <PreviewSidebar {...args} />;

export const Default = Template.bind({});
Default.args = {
  defaultMenu: 'friend',
};
