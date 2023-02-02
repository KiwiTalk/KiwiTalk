import { StoryFn } from '@storybook/react';
import { SideMenuGroupList } from '.';

import { ReactComponent as IconSvg } from './icons/expand_more.svg';

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
};
