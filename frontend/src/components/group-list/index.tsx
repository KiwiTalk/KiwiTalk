import { Children, PropsWithChildren, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as ExpandMoreSvg } from './icons/expand_more.svg';

export type GroupListProp = {
  icon?: JSX.Element,
  name?: string,

  defaultExpanded?: boolean,
}

export const GroupList = ({
  icon,
  name,
  defaultExpanded,

  children,
}: PropsWithChildren<GroupListProp>) => {
  const [expanded, setExpanded] = useState(!!defaultExpanded);

  const childrenCount = Children.count(children);

  return <Container>
    <Header onClick={() => setExpanded(!expanded)}>
      {icon ? <IconBox>{icon}</IconBox> : null}
      <HeaderTitle>
        {name ? <Name>{name}</Name> : null}
        <CountText>{childrenCount}</CountText>
      </HeaderTitle>
      <ExpandMoreIcon data-expanded={expanded} />
    </Header>
    {expanded && childrenCount > 0 ? <ItemList>{children}</ItemList> : null}
  </Container>;
};

const Container = styled.div`
  background-color: rgba(255, 255, 255, 0.5);

  border: 1px solid #DFDEE0;
  border-radius: 0.5rem;
`;

const Header = styled.div`
  padding: 0.5rem;

  display: flex;
`;

const IconBox = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  
  box-sizing: border-box;

  color: #1E2019;

  border: 1px solid #1E2019;
  border-radius: 50%;
`;

const HeaderTitle = styled.div`
  margin-left: 0.5rem;
  margin-right: auto;
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

  color: #BFBDC1;

  &[data-expanded=true] {
    transform: rotate(0.5turn);
  }

  transition: transform 0.25s;
`;
