import { StoryFn } from 'storybook-solidjs';

import { TodoPlaceholder } from '.';

export default {
  title: 'KiwiTalk/TodoPlaceholder',
  component: TodoPlaceholder,
};

const Template: StoryFn<typeof TodoPlaceholder> = (args) =>
  <TodoPlaceholder part={args.part} />;

export const Default = Template.bind({});
Default.args = {
  part: 'Example',
};
