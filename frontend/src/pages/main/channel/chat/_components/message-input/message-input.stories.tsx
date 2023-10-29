import { StoryFn } from 'storybook-solidjs';

import * as styles from './message-input.stories.css';
import { MessageInput, type MessageInputProps } from './message-input';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message Input',
  component: MessageInput,
};

const Template: StoryFn<MessageInputProps> = (props) => {
  return (
    <div class={styles.background}>
      <MessageInput
        {...props}
      />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  placeholder: 'placeholder',
  onSubmit: (msg) => {
    alert(msg);
  },
};
