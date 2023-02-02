import { StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { SideMenu } from '.';
import { SideMenuGroupList } from './group-list';

export default {
  title: 'KiwiTalk/SideMenu',
  component: SideMenu,
};

const Container = styled.div`
  border: 1px solid #000000;
  width: 640px;
  height: 480px;
`;

const Template: StoryFn<typeof SideMenu> = (args) => {
  return <Container>
    <SideMenu {...args}>
      <SideMenuGroupList icon='A'>
        <li>A</li>
        <li>B</li>
        <li>C</li>
      </SideMenuGroupList>
      <SideMenuGroupList icon='X'>
        <li>X</li>
        <li>Y</li>
        <li>Z</li>
      </SideMenuGroupList>
    </SideMenu>
  </Container>;
};

export const Default = Template.bind({});
Default.args = {
  name: 'Example',
  headContents: 'Head contents',
};
