import styled from 'styled-components';
import Color from '../../assets/colors/theme';

export const Button = styled.button`
  width: 100%;
  height: 45px;
  border: none;
  background: ${Color.BLACK};
  color: ${Color.WHITE};
  box-shadow: 0px 4px 20px rgba(26, 60, 68, 0.07);
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
  user-select: none;

  :hover:enabled {
    background: ${Color.BLACK_VARIENT1};
  }

  :focus {
    outline:none;
  }

  :active:enabled {
    background: ${Color.BLACK_VARIENT2};
  }
  
  :disabled {
    background: ${Color.GREY_VARIENT2};
    color: ${Color.GREY};
    border: 1px solid ${Color.GREY};
  }
`;
