import React from 'react';
import styled from 'styled-components';
import ThemeColor from '../../assets/colors/theme';
import background from '../../assets/images/background.svg';
import Kiwi from '../common/kiwi';

const Wrapper = styled.div`margin-top: ${(() => {
    switch (nw.process.platform) {
        case 'darwin':
        case 'cygwin':
        case 'win32':
            return 20;
        default:
            return 0;
    }
})()}px`


const Background1 = styled.div`
z-index: -1;
width: 100vw;
height: 100vh;
position: fixed;
background: linear-gradient(128.19deg, ${ThemeColor.BACKGROUND1} 30.01%, ${ThemeColor.BACKGROUND2} 47.2%);
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
            <Kiwi/>
            {children}
            <VersionText><b>Kiwitalk</b> ver 0.0.1</VersionText>
        </Wrapper>
    )
};

export default LoginBackground;
