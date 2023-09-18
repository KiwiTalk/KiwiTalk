import { styled } from '../../utils';
import InfoIconSvg from './icons/info_black_24dp.svg';
import { container, infoIcon, text } from './index.css';

const Container = styled('div', container);
const InfoIcon = styled(InfoIconSvg, infoIcon);
const Text = styled('p', text);

export type TodoPlaceholderProp = {
  part: string
}

export const TodoPlaceholder = (props: TodoPlaceholderProp) => {
  return <Container>
    <InfoIcon />
    <Text>{props.part} is not implemented yet...</Text>
  </Container>;
};
