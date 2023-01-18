import { ComponentStory } from '@storybook/react';

import { TodoPlaceholder } from '.';

export default {
  title: 'KiwiTalk/TodoPlaceholder',
  component: TodoPlaceholder,
};

const Template: ComponentStory<typeof TodoPlaceholder> = (args) =>
  <TodoPlaceholder part={args.part} />;

export const Default = Template.bind({});
Default.args = {
  part: 'Example',
};
