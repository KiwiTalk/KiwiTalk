import { StoryFn } from '@storybook/react';
import { GroupList } from '.';

import { ReactComponent as IconSvg } from './icons/expand_more.svg';

export default {
  title: 'KiwiTalk/GroupList',
  component: GroupList,
};

const Template: StoryFn<typeof GroupList> = (args) =>
  <GroupList {...args}>
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
    <li>E</li>
    <li>F</li>
  </GroupList>;

export const Default = Template.bind({});
Default.args = {
  name: 'Example',
  icon: <IconSvg />,
};
