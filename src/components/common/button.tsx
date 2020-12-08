import styled from "styled-components";
import Color from '../../assets/colors/theme';

export const Button = styled.button`
  width: 100%;
  height: 45px;
  border: none;
  margin-top: 12px;
  background: ${Color.BUTTON};
  color: #FFFFFF;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
  user-select: none;

  :hover {
    background: ${Color.BUTTON_HOVER};
  }

  :focus {
    outline:none;
  }
`;