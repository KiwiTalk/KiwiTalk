import styled from 'styled-components';
import { ReactComponent as EditIconSvg } from './icons/edit.svg';

export type ProfileProp = {
  profileImageURL?: string,
  name: string,
  contact: string,

  onEditClick?: () => void,
};


export const Profile = ({
  profileImageURL,
  name,
  contact,
  onEditClick,
}: ProfileProp) => {
  return <Container>
    <ImageContainer>
      {profileImageURL && <Image src={profileImageURL} />}
    </ImageContainer>
    <Info>
      <Name>{name}</Name>
      <Contact>{contact}</Contact>
    </Info>
    <EditButton onClick={onEditClick} type='button'>
      <EditIcon />
    </EditButton>
  </Container>;
};

const Container = styled.div`
  background: #FFFFFF;

  display: flex;

  padding: 0.75rem;

  align-items: center;
`;

const ImageContainer = styled.div`
  border: 1px solid #DFDEE0;
  border-radius: 50%;

  box-sizing: border-box;

  overflow: hidden;

  width: 2.25rem;
  height: 2.25rem;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;

  object-fit: cover;
`;

const Info = styled.address`
  all: unset;

  margin-left: 0.75rem;
  margin-right: auto;
`;

const Name = styled.p`
  color: #1E2019;

  margin: 0px;

  font-weight: bold;
  font-size: 1rem;
`;

const Contact = styled.p`
  color: #4D5061;

  margin: 0px;

  font-size: 0.75rem;
`;

const EditButton = styled.button`
  all: unset;

  cursor: pointer;

  width: 2.25rem;
  height: 2.25rem;

  text-align: center;
  line-height: 0px;

  color: #BFBDC1;
`;

const EditIcon = styled(EditIconSvg)`
  width: 1.25rem;
  height: 1.25rem;
`;

