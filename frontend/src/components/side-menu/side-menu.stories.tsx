import { StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { SideMenu } from '.';

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
      <div>A</div>
      <div>B</div>
      <div>C</div>
    </SideMenu>
  </Container>;
};

export const Default = Template.bind({});
Default.args = {
  name: 'Example',
  headContents: 'Head contents',
};
