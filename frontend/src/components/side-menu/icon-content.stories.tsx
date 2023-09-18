import { StoryFn } from 'storybook-solidjs';
import { SideMenuIconContent } from './icon-content';

export default {
  title: 'KiwiTalk/SideMenu/IconContent',
  component: SideMenuIconContent,
};

const Template: StoryFn<typeof SideMenuIconContent> = (args) => {
  return <SideMenuIconContent {...args}>
    Example Text
  </SideMenuIconContent>;
};

export const Default = Template.bind({});
Default.args = {
  icon: 'A',
};
