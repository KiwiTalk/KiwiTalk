import { StoryFn } from 'storybook-solidjs';

import { AttachmentMessage, AttachmentMessageProps } from './attachment-message';

export default {
  title: 'KiwiTalk v2/Channel/Chat/Message/Attachment Message',
  component: AttachmentMessage,
};

const Template: StoryFn<AttachmentMessageProps> = (props) => {
  return (
    <AttachmentMessage
      mimeType={props.mimeType}
      fileName={props.fileName}
      fileSize={props.fileSize}
      expire={props.expire}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  mimeType: 'image/png',
  fileName: 'test.png',
  fileSize: 123456,
  expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
};
