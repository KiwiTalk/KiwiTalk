import React from "react";
import styled from "styled-components";
import kiwi from '../../assets/images/kiwi.svg';

const Kiwi = styled.img`
position: fixed;
width: 70vw;
height: 70vh;
right: -10%;
bottom: -33%;
mix-blend-mode: overlay;
opacity: 0.5;
`;

export default () => {
  return <Kiwi src={kiwi} />
}