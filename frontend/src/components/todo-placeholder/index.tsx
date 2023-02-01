import styled from 'styled-components';
import { ReactComponent as InfoIconSvg } from './icons/info_black_24dp.svg';

const Container = styled.div`
  margin: 1rem;

  border: 1px solid #DFDEE0;
  border-radius: 8px;

  display: flex;
`;

const Inner = styled.div`
  padding: 1rem;

  margin: auto auto;

  color: gray;
  
  text-align: center;

  user-select: none;
`;

const InfoIcon = styled(InfoIconSvg)`
  width: 4rem;
  height: 4rem;
`;

export type TodoPlaceholderProp = {
  part: string
}

export const TodoPlaceholder = ({
  part,
}: TodoPlaceholderProp) => {
  return <Container>
    <Inner>
      <InfoIcon />
      <p>
        {part} is not implemented yet...
      </p>
    </Inner>
  </Container>;
};
