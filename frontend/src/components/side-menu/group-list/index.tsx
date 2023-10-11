import { JSX } from 'solid-js/jsx-runtime';
import { styled } from '../../../utils';
import { SideMenuIconContent } from '../icon-content';
import { SideMenuItemContainer } from '../item-container';
import ExpandMoreSvg from './icons/expand_more.svg';
import { countText, expandMoreIcon, header, itemList, name } from './index.css';
import { ParentProps, Show, children, createSignal } from 'solid-js';

const Header = styled('div', header);
const Name = styled('span', name);
const CountText = styled('span', countText);
const ItemList = styled('ul', itemList);
const ExpandMoreIcon = styled(ExpandMoreSvg, expandMoreIcon);

export type SideMenuGroupListProp = ParentProps<{
  icon: JSX.Element;
  itemCount: number;
  name?: string;

  defaultExpanded?: boolean;
}>;

export const SideMenuGroupList = (props: SideMenuGroupListProp) => {
  const [expanded, setExpanded] = createSignal(!!props.defaultExpanded);

  const childList = children(() => props.children);
  const childrenCount = () => {
    const target = childList();

    return Array.isArray(target) ? target.length : Number(!!childList());
  };

  return <SideMenuItemContainer>
    <Header onClick={() => setExpanded(!expanded())}>
      <SideMenuIconContent icon={props.icon}>
        <Show when={props.name}>
          <Name>{props.name}</Name>
        </Show>
        <Show when={props.itemCount > 0}>
          <CountText>{props.itemCount}</CountText>
        </Show>
        <ExpandMoreIcon data-expanded={expanded()} />
      </SideMenuIconContent>
    </Header>
    <Show when={expanded() && childrenCount() > 0}>
      <ItemList>{childList()}</ItemList>
    </Show>
  </SideMenuItemContainer>;
};
