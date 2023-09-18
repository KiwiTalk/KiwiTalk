import { StoryFn } from 'storybook-solidjs';
import { styled } from '../../utils';
import { LoginScreen } from './screen';
import { innerForm, screen } from './screen.stories.css';

export default {
  title: 'KiwiTalk/login/LoginScreen',
  component: LoginScreen,
};

const Screen = styled(LoginScreen, screen);
const InnerForm = styled('div', innerForm);

const Template: StoryFn<React.PropsWithChildren> = () => {
  return <Screen>
    <InnerForm />
  </Screen>;
};

export const Default = Template.bind({});
Default.args = {};
