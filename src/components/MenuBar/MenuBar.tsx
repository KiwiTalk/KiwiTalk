import React, {useState} from 'react';
import {closeWindow, isWindowMaximized, maxUnMaxWindow, minimizeWindow, registerMaxUnMaximizeEventListener} from '../../functions/electron';
import styled from 'styled-components';
import isElectron from 'is-electron';
import Color from '../../assets/javascripts/color';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
  height: 30px;
  background: ${Color.THEME1};
  position: fixed;
  z-index: 3;
  color: #FFFFFF;
  -webkit-app-region: drag;
  user-select: none;

  div {
    height: 100%;
  }
`;

const Button = styled.button`
  height: 100%;
  padding: 0 15px;
  border: none;
  background: transparent;
  color: white;
  outline: none;
  -webkit-app-region: no-drag;
  
  :hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const CloseButton = styled(Button)`
  :hover {
    background: rgb(255, 0, 0);
  }
`;

const MenuBar = () => {
  const [isMaximum, setMaximum] = useState(false);

  if (!isElectron()) return null;
  registerMaxUnMaximizeEventListener(() => setMaximum(isWindowMaximized()));

  return (
    <Wrapper className={'menu-bar'}>
      <div>
        <Button>
          <i className={'fas fa-bars'}/>
        </Button>
        <span>
          <b>Kiwi Talk</b>
        </span>
      </div>
      <div>
        <Button onClick={() => minimizeWindow()}>
          <i className={'fas fa-window-minimize'}/>
        </Button>
        <Button onClick={() => maxUnMaxWindow()}>
          <i className={'far ' + (isMaximum ? 'fa-clone' : 'fa-square')}/>
        </Button>
        <CloseButton onClick={() => closeWindow()}>
          <i className={'fas fa-times'}/>
        </CloseButton>
      </div>
    </Wrapper>
  )
};

export default MenuBar;
