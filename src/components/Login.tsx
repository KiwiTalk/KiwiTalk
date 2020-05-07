import React from 'react';
import LoginForm from '../components/LoginForm';
import background from '../assets/images/background.svg';
import styled from 'styled-components';

const Wrapper = styled.div`
width: 100%;
height: 100vh;
background: url(${background}) no-repeat center center fixed;
background-size: cover;
`;

const TitleWrapper = styled.div`
padding-top: 50px;
margin: 0 0 50px 50px;
`;

const Title = styled.p`
margin: 0;
font-family: NanumSquareRound,serif;
font-style: normal;
font-weight: 800;
font-size: 36px;

display: flex;
align-items: center;

color: #000000;
text-shadow: 1px 2px 6px rgba(0, 0, 0, 0.2);
`

const SubTitle = styled.span`
font-family: NanumSquareRound,serif;
font-style: normal;
font-weight: 300;
font-size: 12px;

display: flex;
align-items: center;
letter-spacing: -1px;

color: #000000;

text-shadow: 1px 2px 6px rgba(0, 0, 0, 0.2);
`;

const Login = () => {
  return (
    <Wrapper>
      <TitleWrapper>
        <Title>KiwiTalk</Title>
        <SubTitle>로그인하세요</SubTitle>
      </TitleWrapper>
      <LoginForm onSubmit={() => {}}/>
    </Wrapper>
  )
};

export default Login;
