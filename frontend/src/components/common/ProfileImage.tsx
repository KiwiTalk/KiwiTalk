import React, { HTMLAttributes } from 'react';

import styled from 'styled-components';

import ProfileMask from '../../assets/images/profile_mask.svg';

const Wrapper = styled.div`
  width: 48px;
  height: 48px;
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
  
  mask: url(${ProfileMask});
`;

interface ProfileImageProps extends HTMLAttributes<HTMLDivElement> {
    src: string
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  ...args
}) => {
  return (
    <Wrapper {...args}>
      <Image src={src}/>
    </Wrapper>
  );
};

export default ProfileImage;
