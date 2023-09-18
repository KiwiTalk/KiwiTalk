import { StoryFn } from 'storybook-solidjs';
import { WindowTitleBar } from '.';
import { WindowControl } from '../control';
import { styled } from '../../../utils';
import { titleBar, titleBarControl, titleBarTitle } from './title-bar.stories.css';

export default {
  title: 'KiwiTalk/window/WindowTitleBar',
  component: WindowTitleBar,
  argTypes: {},
};

const TitleBar = styled(WindowTitleBar, titleBar);
const TitleBarControl = styled(WindowControl, titleBarControl);
const TitleBarTitle = styled('span', titleBarTitle);

const Template: StoryFn<typeof WindowTitleBar> = () => {
  return <TitleBar>
    <TitleBarTitle>Sample title</TitleBarTitle>
    <TitleBarControl />
  </TitleBar>;
};

export const Default = Template.bind({});
Default.args = {};
