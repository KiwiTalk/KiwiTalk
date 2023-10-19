import { StoryFn } from 'storybook-solidjs';

import { Input, InputProps } from './input';
import * as styles from './input.stories.css';

import IconChat from '@/assets/icons/chat.svg';

export default {
  title: 'KiwiTalk v2/ui/input',
  component: Input,
};

const Template: StoryFn<InputProps> = (props) => {
  return (
    <div class={styles.background}>
      <Input {...props} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { placeholder: 'Placeholder', icon: <IconChat /> };
