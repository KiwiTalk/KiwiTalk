import { JSX } from 'solid-js/jsx-runtime';
import { styled } from '../../../utils';
import ExpandMoreSvg from './icons/expand_more.svg';
import { container, countText, expandMoreIcon, header, iconBox, name } from './index.css';
import { ParentProps, Show, createSignal } from 'solid-js';

const Container = styled('div', container);
const Header = styled('div', header);
const Name = styled('span', name);
const CountText = styled('span', countText);
const ExpandMoreIcon = styled(ExpandMoreSvg, expandMoreIcon);
const IconBox = styled('div', iconBox);

export type SideMenuGroupListProp = ParentProps<{
  icon?: JSX.Element;
  itemCount: number;
  name?: string;

  defaultExpanded?: boolean;
}>;

export const SideMenuGroupList = (props: SideMenuGroupListProp) => {
  const [expanded, setExpanded] = createSignal(!!props.defaultExpanded);

  return <Container>
    <Header onClick={() => setExpanded(!expanded())}>
      <Show when={props.icon}>
        <IconBox>
          {props.icon}
        </IconBox>
      </Show>
      <Show when={props.name}>
        <Name>{props.name}</Name>
      </Show>
      <Show when={props.itemCount > 0}>
        <CountText>{props.itemCount}</CountText>
      </Show>
      <ExpandMoreIcon data-expanded={expanded()} />
    </Header>
    <Show when={expanded()}>
      {props.children}
    </Show>
  </Container>;
};
