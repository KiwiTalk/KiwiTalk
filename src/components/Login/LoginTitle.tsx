import React from 'react';
import styled from 'styled-components';

const TitleWrapper = styled.div`
margin-bottom: 50px;
display: flex;
flex-direction: row;
font-size: 36px;
letter-spacing: -1px;
color: #000000;
text-shadow: 1px 2px 6px rgba(0, 0, 0, 0.2);
`;

const Title1 = styled.span`
font-family: NanumSquareRound, serif;
font-weight: bold;
`

const Title2 = styled.span`
font-family: NanumSquareRound, serif;
margin-left: 10px;
`;

const LoginTitle = () => {
  return (
    <TitleWrapper>
      <Title1>KIWI</Title1>
      <Title2>TALK</Title2>
    </TitleWrapper>
  )
};

export default LoginTitle;
