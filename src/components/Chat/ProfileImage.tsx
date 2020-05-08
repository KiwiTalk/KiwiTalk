import React, {EventHandler, FormEvent, useState} from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
width: 54px;
height: 54px;
`;

const Image = styled.img`
display: block;
margin: 0 auto;
`;

const ProfileImage: React.FC<{src: string}> = ({src}) => {
  return (
    <Wrapper>
      <Image src={src}/>
    </Wrapper>
  );
};

export default ProfileImage;
