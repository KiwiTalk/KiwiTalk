import { StoryFn } from 'storybook-solidjs';

import { Button, ButtonProps } from './button';
import * as styles from './button.stories.css';

export default {
  title: 'KiwiTalk v2/ui/button',
  component: Button,
};

const Template: StoryFn<ButtonProps> = (props) => {
  return (
    <div class={styles.background}>
      <Button variant={props.variant}>
        {props.children}
      </Button>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { variant: 'primary', children: 'Test Button' };
