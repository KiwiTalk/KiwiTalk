import { ParentProps } from 'solid-js';
import { styled } from '../../utils';
import KiwiSvg from './icons/kiwi.svg';
import { container, kiwiIcon } from './index.css';

const Container = styled('div', container);
const KiwiIcon = styled(KiwiSvg, kiwiIcon);

export type KiwiContainerProp = ParentProps<{
  class?: string,
}>;

export const KiwiContainer = (props: KiwiContainerProp) => {
  return <Container class={props.class}>
    <KiwiIcon />
    {props.children}
  </Container>;
};
