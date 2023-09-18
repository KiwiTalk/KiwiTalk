import { StoryFn } from 'storybook-solidjs';
import { Sidebar } from '.';
import { styled } from '../../../utils';
import { sidebar } from './sidebar.stories.css';

export default {
  title: 'KiwiTalk/app/Sidebar',
  component: Sidebar,
  argTypes: {
    onMenuSelect: { action: 'MenuItem' },
    onButtonClick: { action: 'ButtonItem' },
  },
};

const PreviewSidebar = styled(Sidebar, sidebar);

const Template: StoryFn<typeof Sidebar> = (args) =>
  <PreviewSidebar {...args} />;

export const Default = Template.bind({});
Default.args = {
  defaultMenu: 'friend',
};
