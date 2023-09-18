import BackgroundSvg from './images/background.svg';
import BackgroundPatternSvg from './images/background-pattern.svg';
import { KiwiContainer } from '../kiwi-container';
import { styled } from '../../utils';
import { background, backgroundPattern, container, contentContainer } from './container.css';
import { ParentProps } from 'solid-js';

const ContentContainer = styled(KiwiContainer, contentContainer);
const Background = styled(BackgroundSvg, background);
const BackgroundPattern = styled(BackgroundPatternSvg, backgroundPattern);
const Container = styled('div', container);

export type LoginBackgroundProp = ParentProps<{
  class?: string
}>;

export const LoginContainer = (props: LoginBackgroundProp) => {
  return <Container class={props.class}>
    <BackgroundPattern />
    <Background />
    <ContentContainer>
      {props.children}
    </ContentContainer>
  </Container>;
};
