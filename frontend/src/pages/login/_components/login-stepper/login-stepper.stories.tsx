import { StoryFn } from 'storybook-solidjs';

import { LoginStepper, LoginStepperProps } from './login-stepper';

import IconA from '@/assets/icons/chat.svg';
import IconB from '@/assets/icons/notification.svg';
import IconC from '@/assets/icons/search.svg';
import IconD from '@/assets/icons/settings.svg';

import * as styles from './login-stepper.stories.css';

export default {
  title: 'KiwiTalk v2/Login/Login Stepper',
  component: LoginStepper,
  argTypes: { onBack: { action: 'clicked' } },
};

const Template: StoryFn<LoginStepperProps> = (props) => {
  return (
    <div class={styles.background}>
      <LoginStepper {...props} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  steps: [
    {
      id: 'step1',
      title: 'Step 1',
      icon: <IconA />,
    },
    {
      id: 'step2',
      title: 'Step 2',
      icon: <IconB />,
    },
    {
      id: 'step3',
      title: 'Step 3',
      icon: <IconC />,
    },
    {
      id: 'step4',
      title: 'Step 4',
      icon: <IconD />,
    },
  ],
  step: 'step2',
  enableBack: true,
  onBack() {
    alert('Back');
  },
};

