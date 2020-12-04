import React, {HTMLAttributes} from 'react';
import styled from 'styled-components';
import ProfileMaskF7 from '../../assets/images/profile_mask_F7.svg';
import ProfileMaskFF from '../../assets/images/profile_mask_FF.svg';
import ProfileMaskBackground from '../../assets/images/profile_mask_background.svg';

const Wrapper = styled.div`
  width: 54px;
  height: 54px;
  position: relative;
  user-select: none;
`;

const Image = styled.img`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  -webkit-user-drag: none;
`;

export enum ProfileImageBackgroundColor {
    // eslint-disable-next-line no-unused-vars
    GRAY_900 = 0,
    // eslint-disable-next-line no-unused-vars
    GRAY_800 = 1,
    // eslint-disable-next-line no-unused-vars
    BACKGROUND = 2
}

interface ProfileImageProps extends HTMLAttributes<HTMLDivElement> {
    src: string
    backgroundColor: ProfileImageBackgroundColor
}

const getBackground = (backgroundColor: ProfileImageBackgroundColor) => {
  switch (backgroundColor) {
    case ProfileImageBackgroundColor.GRAY_900:
      return ProfileMaskFF;
    case ProfileImageBackgroundColor.GRAY_800:
      return ProfileMaskF7;
    case ProfileImageBackgroundColor.BACKGROUND:
      return ProfileMaskBackground;
  }
};

const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  backgroundColor,
  ...args
}) => {
  return (
    <Wrapper {...args}>
      <Image src={src}/>
      <Image src={getBackground(backgroundColor)}/>
    </Wrapper>
  );
};

export default ProfileImage;
