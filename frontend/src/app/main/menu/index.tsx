import styled from 'styled-components';
import { SideMenu } from '../../../components/side-menu';

export const AppSideMenu = styled(SideMenu)`
  background: #F2F2F3;

  border-radius: 0.5rem 0px 0px 0px;

  height: 100%;
`;

export const SideButton = styled.button`
  all: unset;

  margin: 0px 0.125rem;
  padding: 0.25rem;

  width: 2rem;
  height: 2rem;

  box-sizing: border-box;

  border-radius: 50%;

  color: #1E2019;

  &:hover {
    background: rgba(0, 0, 0, 0.09);
  }

  transition: background 0.25s;
`;
