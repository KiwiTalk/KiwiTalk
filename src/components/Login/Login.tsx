import React from 'react';
import styled from 'styled-components';
import Color from '../../assets/javascripts/color';

import LoginForm from './LoginForm';

import background from '../../assets/images/background.svg';
import kiwi from '../../assets/images/kiwi.svg';

const Wrapper = styled.div`
width: 100%;
height: 100vh;
background: linear-gradient(128.19deg, ${Color.THEME1} 30.01%, ${Color.THEME2} 47.2%);
`;

const FormWrapper = styled.div`
width: 100%;
height: 100%;
background: url(${background}) no-repeat left top fixed;

display: flex;
flex-direction: column;
justify-content: center;
position: fixed;
z-index: 1;

@media screen and (max-width: 1280px) {
background-size: 1280px 720px;
}
`;

const TitleWrapper = styled.div`
margin: 0 0 50px 50px;
display: flex;
flex-direction: row;
font-size: 36px;
letter-spacing: -1px;
color: #000000;
text-shadow: 1px 2px 6px rgba(0, 0, 0, 0.2);
`;

const Title1 = styled.span`
font-family: NanumBarunGothic,serif;
font-weight: bold;
`

const Title2 = styled.span`
font-family: NanumBarunGothic,serif;
margin-left: 10px;
`;

const Kiwi = styled.img`
position: fixed;
width: 100%;
height: 100%;
right: -30%;
bottom: -50%;
`;


const Login = () => {
  return (
    <Wrapper>
      <FormWrapper>
        <TitleWrapper>
          <Title1>KIWI</Title1>
          <Title2>TALK</Title2>
        </TitleWrapper>
        <LoginForm onSubmit={() => {}}/>
      </FormWrapper>
      <Kiwi src={kiwi} alt={'kiwi'}/>
    </Wrapper>
  )
};

export default Login;
