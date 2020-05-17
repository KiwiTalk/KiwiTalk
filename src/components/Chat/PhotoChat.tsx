import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

interface PhotoChatProps {
  width: number,
  height: number,
  url: string,
}

const resize = (width: number, height: number) => {
  const ratio = width / height

  if (ratio >= 1) {
    width = Math.min(300, width)
    height = 1 / ratio * width
  } else {
    height = Math.min(500, height)
    width = ratio * height
  }

  return [width, height]
}

export const PhotoChat: React.FC<PhotoChatProps> = (chat: PhotoChatProps) => {
  return (
    <Wrapper>
      {
        (() => {
          const [w, h] = resize(chat.width, chat.height)

          // eslint-disable-next-line jsx-a11y/alt-text
          return <img src={chat.url} style={{ width: w + 'px', height: h + 'px' }} />
        })()
      }
    </Wrapper>
  );
};

export default PhotoChat;
