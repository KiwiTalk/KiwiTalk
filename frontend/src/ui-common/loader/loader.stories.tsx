import { StoryFn } from 'storybook-solidjs';

import { Loader } from './loader';

export default {
  title: 'KiwiTalk v2/ui/Loader',
  component: Loader,
};

const Template: StoryFn = (props) => {
  return (
    <Loader {...props} />
  );
};

export const Default = Template.bind({});
Default.args = {};
