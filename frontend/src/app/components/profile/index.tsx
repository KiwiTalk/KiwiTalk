import { Show } from 'solid-js';
import { button } from '../../../components/button/index.css';
import { styled } from '../../../utils';
import EditIconSvg from './icons/edit.svg';
import {
  contact, container, editButton, editIcon, image, imageContainer, info, name,
} from './index.css';

const Container = styled('div', container);
const ImageContainer = styled('div', imageContainer);
const Image = styled('img', image);
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
    <ImageContainer>
      <Show when={props.profileImageURL}>
        <Image src={props.profileImageURL} />
      </Show>
    </ImageContainer>
    <Info>
      <Name>{props.name}</Name>
      <Contact>{props.contact}</Contact>
    </Info>
    <EditButton onClick={props.onEditClick} type='button'>
      <EditIcon />
    </EditButton>
  </Container>;
};
