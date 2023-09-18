import { StoryFn } from 'storybook-solidjs';
import { Profile } from '.';
import { styled } from '../../../utils';
import { container } from './profile.stories.css';

export default {
  title: 'KiwiTalk/app/Profile',
  component: Profile,
  argTypes: {
    onEditClick: { action: 'EditClicked' },
  },
};

const Container = styled('div', container);

const Template: StoryFn<typeof Profile> = (args) =>
  <Container>
    <Profile {...args} />
  </Container>;

export const Default = Template.bind({});
Default.args = {
  name: 'Example',
  contact: 'example@example.com',
};
