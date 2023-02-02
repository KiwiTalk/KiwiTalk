import { Children, PropsWithChildren, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { SideMenuIconContent } from '../icon-content';
import { SideMenuItemContainer } from '../item-container';
import { ReactComponent as ExpandMoreSvg } from './icons/expand_more.svg';

export type SideMenuGroupListProp = {
  icon: ReactNode,
  name?: string,

  defaultExpanded?: boolean,
}

export const SideMenuGroupList = ({
  icon,
  name,
  defaultExpanded,

  children,
}: PropsWithChildren<SideMenuGroupListProp>) => {
  const [expanded, setExpanded] = useState(!!defaultExpanded);

  const childrenCount = Children.count(children);

  return <SideMenuItemContainer>
    <Header onClick={setExpanded.bind(null, !expanded)}>
      <SideMenuIconContent icon={icon}>
        {name ? <Name>{name}</Name> : null}
        <CountText>{childrenCount}</CountText>
        <ExpandMoreIcon data-expanded={expanded} />
      </SideMenuIconContent>
    </Header>
    {expanded && childrenCount > 0 ? <ItemList>{children}</ItemList> : null}
  </SideMenuItemContainer>;
};

const Header = styled.div`
  padding: 0.5rem;
`;

const Name = styled.span`
  user-select: none;
  margin-right: 0.5rem;

  overflow: hidden;
  text-overflow: ellipsis;
`;

const CountText = styled.span`
  user-select: none;

  color: #BFBDC1;
`;

const ItemList = styled.ul`
  border-top: 1px solid #DFDEE0;

  margin: 0px;

  padding: 0px;
  list-style-type: none;
`;

const ExpandMoreIcon = styled(ExpandMoreSvg)`
  width: 1.5rem;
  height: 1.5rem;

  align-self: center;

  margin-left: auto;

  color: #BFBDC1;

  &[data-expanded=true] {
    transform: rotate(0.5turn);
  }

  transition: transform 0.25s;
`;
