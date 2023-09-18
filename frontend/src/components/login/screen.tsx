import { LoginContainer } from './container';
import TextLogoSvg from './icons/text_logo.svg';
import { ParentProps } from 'solid-js';
import { contentContainer, textLogo } from './screen.css';
import { styled } from '../../utils';

const ContentContainer = styled('div', contentContainer);
const TextLogo = styled(TextLogoSvg, textLogo);

export type LoginScreenProp = {
  class?: string,
};

export const LoginScreen = (props: ParentProps<LoginScreenProp>) => {
  return <LoginContainer class={props.class}>
    <ContentContainer>
      <TextLogo />
      {props.children}
    </ContentContainer>
  </LoginContainer>;
};
