import { StoryFn } from 'storybook-solidjs';

import { LoginCard, LoginCardProps } from './login-card';

import * as styles from './login-card.stories.css';

export default {
  title: 'KiwiTalk v2/Login/Login Card',
  component: LoginCard,
};

const Template: StoryFn<LoginCardProps> = (props) => {
  return (
    <div class={styles.background}>
      <LoginCard {...props} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  profile: 'https://picsum.photos/200',
  name: 'John Doe',
  email: 'john.doe' + Math.random().toString(36).substring(7) + '@example.com',
};
