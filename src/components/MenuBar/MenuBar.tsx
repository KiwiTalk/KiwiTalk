import React, {useState} from 'react';
import styled from 'styled-components';
import ThemeColor from '../../assets/colors/theme';

import iconLogo from '../../assets/images/logo_text_small.svg';

import iconMinimize from '../../assets/images/icon_minimize.svg';
import iconMaximize from '../../assets/images/icon_maximize.svg';
import iconClose from '../../assets/images/icon_close.svg';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
  height: 20px;
  background: ${ThemeColor.GREY_900};
  position: fixed;
  top: 0;
  left: 0;
  color: #FFFFFF;
  -webkit-app-region: drag;
  user-select: none;

  div {
    height: 100%;
  }
`;

const Button = styled.button`
  height: 100%;
  padding: 0 8px;
  border: none;
  background: transparent;
  color: white;
  outline: none;
  -webkit-app-region: no-drag;
  
  :hover {
    background: rgba(0, 0, 0, 0.1);
  }

  transition: all 0.25s;
`;

const CloseButton = styled(Button)`
  :hover {
    background: rgb(255, 0, 0);
  }
`;

const Image = styled.img`
  -webkit-user-drag: none;
`;

const MenuBar = () => {
    const [isMaximum, setMaximum] = useState(false);

    const win = nw.Window.get();
    win.once('maximize', () => setMaximum(true));
    win.once('restore', () => setMaximum(false));

    return (
        <Wrapper className={'menu-bar'}>
            <div>
                <Button>
                    <Image src={iconLogo}/>
                </Button>
            </div>
            <div>
                <Button onClick={() => win.minimize()}>
                    <Image src={iconMinimize}/>
                </Button>
                <Button onClick={() => isMaximum ? win.restore() : win.maximize()}>
                    <Image src={iconMaximize}/>
                </Button>
                <CloseButton onClick={() => win.close()}>
                    <Image src={iconClose}/>
                </CloseButton>
            </div>
        </Wrapper>
    )
};

export default MenuBar;
