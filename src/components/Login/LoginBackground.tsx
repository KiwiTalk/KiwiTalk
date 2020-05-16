import React from 'react';
import styled from 'styled-components';
import Color from '../../assets/javascripts/color';
import background from '../../assets/images/background.svg';
import kiwi from '../../assets/images/kiwi.svg';

const Wrapper = styled.div`
margin-top: 30px;
`

const Background1 = styled.div`
z-index: -1;
width: 100vw;
height: 100vh;
position: fixed;
background: linear-gradient(128.19deg, ${Color.THEME1} 30.01%, ${Color.THEME2} 47.2%);
`;

const Background2 = styled.div`
z-index: -1;
width: 100vw;
height: 100vh;
background: url(${background}) no-repeat left top fixed;
position: fixed;
animation: slide 3s;

@media screen and (max-width: 1280px) {
  background-size: 1280px 720px;
}

@keyframes slide {
  from {
    background-position: -100vw -100vh;
  }
  to {
    background-position: 0 0;
   }
}
`;

const Kiwi = styled.img`
position: fixed;
width: 70vw;
height: 70vh;
right: -10%;
bottom: -33%;
mix-blend-mode: overlay;
opacity: 0.5;
`;

const VersionText = styled.span`
position: absolute;
left: 13px;
bottom: 10px;
font-size: 8px;
`;

const LoginBackground: React.FC = ({children}) => {
  return (
    <Wrapper>
      <Background1/>
      <Background2/>
      <Kiwi src={kiwi}/>
      {children}
      <VersionText><b>Kiwitalk</b> ver 0.0.1</VersionText>
    </Wrapper>
  )
};

export default LoginBackground;