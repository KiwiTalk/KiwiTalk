import styled from 'styled-components';
import { LoginBackground } from './background';
import { ReactComponent as TextLogoSvg } from './icons/text_logo.svg';
import React from 'react';

const ContentContainer = styled.div`
  position: relative;
  left: 0px;
  top: 0px;
  padding: 3rem 3rem;
`;

const TextLogo = styled(TextLogoSvg)`
  margin-bottom: 54px;
  color: black;
`;

const Background = styled(LoginBackground)`
  position: absolute;
  z-index: -999999;
`;

const FormContainer = styled.div`
  width: 281px;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

export const LoginScreen: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <Container>
    <Background />
    <ContentContainer>
      <TextLogo />
      <FormContainer>
        {children}
      </FormContainer>
    </ContentContainer>
  </Container>;
};
