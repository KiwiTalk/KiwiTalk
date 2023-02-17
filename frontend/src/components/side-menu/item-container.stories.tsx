import { StoryFn } from '@storybook/react';
import { SideMenuItemContainer } from './item-container';

export default {
  title: 'KiwiTalk/SideMenu/ItemContainer',
  component: SideMenuItemContainer,
};

const Template: StoryFn<typeof SideMenuItemContainer> = (args) => {
  return <SideMenuItemContainer {...args}>
    Example Text
  </SideMenuItemContainer>;
};

export const Default = Template.bind({});
Default.args = {};
