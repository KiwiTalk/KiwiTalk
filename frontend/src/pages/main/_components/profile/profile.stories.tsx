import { StoryFn } from 'storybook-solidjs';

import * as styles from './profile.stories.css';
import { Profile } from './profile';

export default {
  title: 'KiwiTalk v2/Profile',
  component: Profile,
};

type ProfileProps = { badge?: number; src?: string; };
const Template: StoryFn<ProfileProps> = (props) => {
  return (
    <div class={styles.background}>
      <Profile
        src={props.src}
        badge={props.badge}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { badge: 6, src: 'https://picsum.photos/200' };

export const Empty = Template.bind({});
Empty.args = { badge: 6 };
