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
    {icon && <IconBox>{icon}</IconBox>}
    {children}
  </Container>;
};

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const IconBox = styled.div`
  width: 1.75rem;
  height: 1.75rem;

  padding: 0.25rem;
  
  box-sizing: border-box;

  color: #1E2019;

  border: 1px solid #1E2019;
  border-radius: 50%;

  text-align: center;
  line-height: 0px;

  margin-right: 0.5rem;
`;
