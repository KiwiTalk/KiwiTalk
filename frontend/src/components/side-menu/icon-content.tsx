import { PropsWithChildren, ReactNode } from 'react';
import styled from 'styled-components';

export type SideMenuIconContentProp = {
  icon?: ReactNode,
}

export const SideMenuIconContent = ({
  icon,

  children,
}: PropsWithChildren<SideMenuIconContentProp>) => {
  return <Container>
    {icon ? <IconBox>{icon}</IconBox> : null}
    {children}
  </Container>;
};

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const IconBox = styled.div`
  width: 1.5rem;
  height: 1.5rem;

  box-sizing: border-box;

  color: #1E2019;

  border: 1px solid #1E2019;
  border-radius: 50%;

  text-align: center;
  line-height: 0px;

  margin-right: 0.5rem;
`;
