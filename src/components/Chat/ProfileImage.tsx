import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import ProfileMaskF7 from '../../assets/images/profile_mask_F7.svg';
import ProfileMaskFF from '../../assets/images/profile_mask_FF.svg';

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
`;

interface ProfileImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string
  focus: boolean
}

const ProfileImage: React.FC<ProfileImageProps> = ({src, focus, ...args}) => {
  return (
    <Wrapper {...args}>
      <Image src={src}/>
      <Image src={focus ? ProfileMaskF7 : ProfileMaskFF}/>
    </Wrapper>
  );
};

export default ProfileImage;
