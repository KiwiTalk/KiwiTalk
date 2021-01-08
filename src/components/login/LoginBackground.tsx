import React from 'react';
import styled from 'styled-components';

import KiwiBackground from '../common/kiwi-background';
import LoginTitle from './LoginTitle';

const Wrapper = styled.div`
  padding: 50px 0 0 50px;

  @media screen and (max-width: 560px) {
    width: 100vw;
    height: calc(100vh - 30px);
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

const LoginBackground: React.FC = ({ children }) => {
  return <KiwiBackground>
    <Wrapper>
      <LoginTitle/>
      {children}
    </Wrapper>
  </KiwiBackground>;
};

export default LoginBackground;
