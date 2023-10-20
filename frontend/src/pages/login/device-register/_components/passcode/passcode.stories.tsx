import { StoryFn } from 'storybook-solidjs';

import { Passcode, PasscodeProps } from './passcode';

import * as styles from './passcode.stories.css';

export default {
  title: 'KiwiTalk v2/Login/Device Register/Passcode',
  component: Passcode,
};

const Template: StoryFn<PasscodeProps> = (props) => {
  return (
    <div class={styles.background}>
      <Passcode {...props} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  onSubmit(code) {
    alert(`Your code is "${code}"`);
  },
};
