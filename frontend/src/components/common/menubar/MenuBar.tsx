import React, { useState } from 'react';
import styled from 'styled-components';
import ThemeColor from '../../../assets/colors/theme';

import iconLogo from '../../../assets/images/logo_text_small.svg';

import iconMinimize from '../../../assets/images/icon_minimize.svg';
import iconMaximize from '../../../assets/images/icon_maximize.svg';
import iconClose from '../../../assets/images/icon_close.svg';

const Wrapper = styled.div`
  width: 100vw;
  height: 20px;

  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;

  background: ${ThemeColor.GREY_900};
  color: #FFFFFF;

  position: fixed;
  top: 0;
  left: 0;

  -webkit-app-region: drag;
  user-select: none;
`;

const ButtonWrapper = styled.div`
  height: 20px;

  display: flex;
  flex-flow: row;

  -webkit-app-region: drag;
  user-select: none;
`;

const Button = styled.button`
  height: 100%;

  padding: 0 8px;

  border: none;
  outline: none;
  cursor: pointer;

  background: transparent;
  color: white;

  -webkit-app-region: no-drag;

  :hover {
    background: rgba(0, 0, 0, 0.1);
  }

  transition: all 0.25s;
`;

const CloseButton = styled(Button)`
  :hover {
    background: red;
  }
`;

const Image = styled.img`
  -webkit-user-drag: none;
`;

const MenuBar = (): JSX.Element => {
  const [isMaximum, setMaximum] = useState(false);

  const window = nw.Window.get();
  window.once('maximize', () => setMaximum(true));
  window.once('restore', () => setMaximum(false));

  return (
    <Wrapper className={'menu-bar'}>
      <Button>
        <Image src={iconLogo}/>
      </Button>
      <div style={{ flex: 1 }}/>
      <ButtonWrapper>
        <Button onClick={() => window.minimize()}>
          <Image src={iconMinimize}/>
        </Button>
        <Button onClick={
          () => {
            if (isMaximum) window.restore();
            else window.maximize();
          }
        }>
          <Image src={iconMaximize}/>
        </Button>
        <CloseButton onClick={() => window.close()}>
          <Image src={iconClose}/>
        </CloseButton>
      </ButtonWrapper>
    </Wrapper>
  );
};

export default MenuBar;
