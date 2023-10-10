import { StoryFn } from 'storybook-solidjs';
import { SideMenuGroupList } from '.';

import IconSvg from './icons/expand_more.svg';

export default {
  title: 'KiwiTalk/SideMenu/GroupList',
  component: SideMenuGroupList,
};

const Template: StoryFn<typeof SideMenuGroupList> = (args) =>
  <SideMenuGroupList {...args}>
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
    <li>E</li>
    <li>F</li>
  </SideMenuGroupList>;

export const Default = Template.bind({});
Default.args = {
  name: 'Example',
  icon: <IconSvg />,
  itemCount: 6,
};
