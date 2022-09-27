import styled from 'styled-components';
import { LoginBackground } from './background';
import { ReactComponent as TextLogoSvg } from './images/text_logo.svg';
import React from 'react';

const FormInnerContainer = styled.div`
  position: relative;
  left: 0px;
  top: 0px;
  padding: 3rem 3rem;
`;

const TextLogo = styled(TextLogoSvg)`
  margin-bottom: 54px;
`;

const Background = styled(LoginBackground)`
  position: absolute;
  z-index: -999999;
`;

const FormContainer = styled.div`
  width: 281px;
`;

export const LoginScreen: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <>
    <Background />
    <FormInnerContainer>
      <TextLogo />
      <FormContainer>
        {children}
      </FormContainer>
    </FormInnerContainer>
  </>;
};
