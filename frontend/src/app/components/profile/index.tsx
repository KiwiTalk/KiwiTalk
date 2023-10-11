import { button } from '../../../components/button/index.css';
import { styled } from '../../../utils';
import EditIconSvg from './icons/edit.svg';
import {
  contact, container, editButton, editIcon, imageContainer, info, name,
} from './index.css';

const Container = styled('div', container);
const ImageContainer = styled('div', imageContainer);
const Info = styled('address', info);
const Name = styled('p', name);
const Contact = styled('p', contact);
const EditButton = styled(button, editButton);
const EditIcon = styled(EditIconSvg, editIcon);

export type ProfileProp = {
  profileImageURL?: string,
  name: string,
  contact: string,

  onEditClick?: () => void,
};

export const Profile = (props: ProfileProp) => {
  return <Container>
    <ImageContainer
      style={{ 'background-image': props.profileImageURL ? `url(${props.profileImageURL})` : '' }}
    />
    <Info>
      <Name>{props.name}</Name>
      <Contact>{props.contact}</Contact>
    </Info>
    <EditButton onClick={props.onEditClick} type='button'>
      <EditIcon />
    </EditButton>
  </Container>;
};
