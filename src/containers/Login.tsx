import React, {FormEvent} from 'react';
import styled from 'styled-components';
import Color from '../assets/javascripts/color';
import kiwi from '../assets/images/kiwi.svg';

import LoginForm from '../components/Login/LoginForm';

const Wrapper = styled.div`
width: 100%;
height: 100vh;
background: linear-gradient(128.19deg, ${Color.THEME1} 30.01%, ${Color.THEME2} 47.2%);
`;

const Kiwi = styled.img`
position: fixed;
width: 100%;
height: 100%;
right: -30%;
bottom: -50%;
`;

const VersionText = styled.span`
position: fixed;
left: 13px;
bottom: 10px;
font-size: 8px;
z-index: 2;
`;

const Login = () => {
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    //TODO
  };

  return (
    <Wrapper>
      <LoginForm onSubmit={onSubmit}/>
      <Kiwi src={kiwi} alt={'kiwi'}/>
      <VersionText><b>Kiwitalk</b> ver 0.0.1</VersionText>
    </Wrapper>
  )
};

export default Login;
