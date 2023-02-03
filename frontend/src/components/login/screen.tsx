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

const Container = styled(LoginContainer)`
  width: 100%;
  height: 100%;
`;

export const LoginScreen = ({
  children,
}: React.PropsWithChildren) => {
  return <Container>
    <ContentContainer>
      <TextLogo />
      {children}
    </ContentContainer>
  </Container>;
};
