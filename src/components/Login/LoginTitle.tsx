import React from 'react';
import styled from 'styled-components';
import logo from '../../assets/images/text_logo.svg';

const TitleWrapper = styled.div`
  margin-bottom: 50px;
  color: #000000;
`;

const Logo = styled.img`
`;

const LoginTitle = () => {
  return (
    <TitleWrapper>
      <Logo src={logo} alt={'logo'}/>
    </TitleWrapper>
  )
};

export default LoginTitle;
