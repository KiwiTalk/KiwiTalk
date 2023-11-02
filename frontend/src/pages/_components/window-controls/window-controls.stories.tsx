import { StoryFn } from 'storybook-solidjs';

import { WindowControls } from './window-controls';
import * as styles from './window-controls.stories.css';

export default {
  title: 'KiwiTalk v2/WindowControls',
  component: WindowControls,
};

const Template: StoryFn<{ isActive: boolean }> = (props) => {
  return (
    <div class={styles.background}>
      <WindowControls isActive={props.isActive} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { isActive: true };

export const Inactive = Template.bind({});
Inactive.args = { isActive: false };
