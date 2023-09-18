import { JSX, ParentProps, Show } from 'solid-js';
import { styled } from '../../utils';
import { container, iconBox } from './icon-content.css';

const Container = styled('div', container);
const IconBox = styled('div', iconBox);

export type SideMenuIconContentProp = ParentProps<{
  icon?: JSX.Element;
}>;

export const SideMenuIconContent = (props: SideMenuIconContentProp) => {
  return <Container>
    <Show when={props.icon}>
      <IconBox>
        {props.icon}
      </IconBox>
    </Show>
    {props.children}
  </Container>;
};
