import { StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { Profile } from '.';

export default {
  title: 'KiwiTalk/app/Profile',
  component: Profile,
  argTypes: {
    onEditClick: { action: 'EditClicked' },
  },
};

const Container = styled.div`
  border: solid black 1px;

  width: 300px;
`;

const Template: StoryFn<typeof Profile> = (args) =>
  <Container>
    <Profile {...args} />
  </Container>;

export const Default = Template.bind({});
Default.args = {
  name: 'Example',
  contact: 'example@example.com',
};
