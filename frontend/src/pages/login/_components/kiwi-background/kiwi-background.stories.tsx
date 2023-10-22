import { StoryFn } from 'storybook-solidjs';

import { KiwiBackground } from './kiwi-background';

import * as styles from './kiwi-background.stories.css';

export default {
  title: 'KiwiTalk v2/Login/Kiwi Background',
  component: KiwiBackground,
};

const Template: StoryFn = () => {
  return (
    <div class={styles.background}>
      <KiwiBackground />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {};
