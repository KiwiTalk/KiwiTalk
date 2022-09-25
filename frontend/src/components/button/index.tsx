import styled from 'styled-components';

export const Button = styled.button`
  background: #1E2019;
  color: #FFFFFF;
  box-shadow: 0px 4px 20px rgba(26, 60, 68, 0.07);
  border-radius: 12px;
  user-select: none;
  border: none;
  outline: none;

  font-weight: 600;
  font-size: 12px;
  
  transition: all 0.25s;

  :hover:enabled {
    background: #30323D;
  }

  :focus {
    outline: none;
  }

  :active:enabled {
    background: #4D5061;
  }
  
  :disabled {
    background: #F2F2F3;
    color: #BFBDC1;
    outline: 1px solid #BFBDC1;
  }
`;
