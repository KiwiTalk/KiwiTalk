import { StoryFn } from 'storybook-solidjs';
import { SideMenu } from '.';
import { SideMenuGroupList } from './group-list';
import { styled } from '../../utils';
import { height, storyContainer, width } from '../../utils/story.css';
import { assignInlineVars } from '@vanilla-extract/dynamic';

export default {
  title: 'KiwiTalk/SideMenu',
  component: SideMenu,
};

const Container = styled('div', storyContainer);

const Template: StoryFn<typeof SideMenu> = (args) => {
  return <div
    style={assignInlineVars({
      [width]: '100%',
      [height]: '100%',
    })}
  >
    <Container>
      <SideMenu {...args}>
        <SideMenuGroupList name='ABC' icon='A'>
          <li>A</li>
          <li>B</li>
          <li>C</li>
        </SideMenuGroupList>
        <SideMenuGroupList name='XYZ' icon='X'>
          <li>X</li>
          <li>Y</li>
          <li>Z</li>
        </SideMenuGroupList>
      </SideMenu>
    </Container>
  </div>;
};

export const Default = Template.bind({});
Default.args = {
  name: 'Example',
  headContents: 'Head contents',
};
