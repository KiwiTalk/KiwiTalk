import { StoryFn } from 'storybook-solidjs';

import { CheckBox } from './check-box';
import { createSignal } from 'solid-js';

export default {
  title: 'KiwiTalk v2/ui/CheckBox',
  component: CheckBox,
};

const Template: StoryFn = () => {
  const [checked, setChecked] = createSignal(false);

  return (
    <CheckBox
      checked={checked()}
      onChange={() => setChecked(!checked())}
    >
      Label
    </CheckBox>
  );
};

export const Default = Template.bind({});
Default.args = {};
