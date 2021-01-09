import { Backdrop } from '@material-ui/core';
import React, { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: block;
  overflow: hidden;
`;

const Image = styled.img`
  cursor: pointer;
  
  display: block;
`;

export interface PhotoChatProps {
  width: number,
  height: number,
  url: string,
  ratio: number,
  limit: number[],
}

const resize = (
    width: number,
    height: number,
    customRatio = -1,
    limit = [300, 500],
) => {
  const ratio = customRatio <= 0 ? width / height : customRatio;
  let [w, h] = [width, height];

  if (ratio > 1) {
    w = Math.min(limit[0], width);
    h = 1 / ratio * w;
  } else {
    h = Math.min(limit[1], height);
    w = ratio * h;
  }

  return [w, h];
};

export const Photo: React.FC<PhotoChatProps> = (data: PhotoChatProps) => {
  const [url, setUrl] = useState('');

  const [w, h] = resize(data.width, data.height, data.ratio, data.limit);

  return (
    <Wrapper style={{ width: w + 'px', height: h + 'px' }}>
      <Image
        src={data.url}
        style={
          data.width / data.height < 1 ? {
            width: '100%',
            height: 'auto',
          } : {
            width: 'auto',
            height: '100%',
          }
        }
        onClick={() => setUrl(data.url)}/>
      <Backdrop
        style={{
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.7)',
        }}
        open={url !== ''}
        onClick={() => setUrl('')}>
        <img
          style={{
            maxHeight: '90vh',
            maxWidth: '90vw',
          }}
          src={url}/>
      </Backdrop>
    </Wrapper>
  );
};

export default Photo;
