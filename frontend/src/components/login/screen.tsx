import styled from 'styled-components';
import { LoginContainer } from './container';
import { ReactComponent as TextLogoSvg } from './icons/text_logo.svg';

const ContentContainer = styled.div`
  position: relative;
  left: 0px;
  top: 0px;
  padding: 3rem 3rem;

  width: 281px;
`;

const TextLogo = styled(TextLogoSvg)`
  margin-bottom: 54px;
  color: black;
`;

export type LoginScreenProp = {
  className?: string,
};

export const LoginScreen = ({
  className,

  children,
}: React.PropsWithChildren<LoginScreenProp>) => {
  return <LoginContainer className={className}>
    <ContentContainer>
      <TextLogo />
      {children}
    </ContentContainer>
  </LoginContainer>;
};
