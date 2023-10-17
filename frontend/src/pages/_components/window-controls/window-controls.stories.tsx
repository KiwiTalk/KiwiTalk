import { StoryFn } from 'storybook-solidjs';

import { WindowControls, WindowControlsViewModelType } from './window-controls';
import * as styles from './window-controls.stories.css';

export default {
  title: 'KiwiTalk v2/WindowControls',
  component: WindowControls,
};

const Template: StoryFn<{ isActive: boolean }> = (props) => {
  const isActive = () => props.isActive;
  const NoOpViewModel: WindowControlsViewModelType = () => ({
    onMinimize: () => {},
    onMaximize: () => {},
    onClose: () => {},
    isActive,
  });

  return (
    <div class={styles.background}>
      <WindowControls viewModel={NoOpViewModel}/>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = { isActive: true };

export const Inactive = Template.bind({});
Inactive.args = { isActive: false };
