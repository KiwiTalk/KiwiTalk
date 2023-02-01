import styled from 'styled-components';
import { ReactComponent as InfoIconSvg } from './icons/info_black_24dp.svg';

const Container = styled.div`
  margin: auto;
  padding: 1rem;

  border: 1px solid #DFDEE0;
  border-radius: 8px;

  width: max-content;

  color: gray;
  
  text-align: center;

  user-select: none;
`;

const InfoIcon = styled(InfoIconSvg)`
  width: 4rem;
  height: 4rem;

  padding-bottom: 1rem;
`;

const Text = styled.p`
  margin-bottom: 0px;
`;

export type TodoPlaceholderProp = {
  part: string
}

export const TodoPlaceholder = ({
  part,
}: TodoPlaceholderProp) => {
  return <Container>
      <InfoIcon />
      <Text>{part} is not implemented yet...</Text>
  </Container>;
};
