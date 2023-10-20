import { StoryFn } from 'storybook-solidjs';

import { ErrorTip, ErrorTipProps } from './error-tip';

import * as styles from './error-tip.stories.css';

export default {
  title: 'KiwiTalk v2/Login/Error Tip',
  component: ErrorTip,
};

const Template: StoryFn<ErrorTipProps> = (props) => {
  return (
    <div class={styles.background}>
      <ErrorTip {...props} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { message: 'Error message' };
