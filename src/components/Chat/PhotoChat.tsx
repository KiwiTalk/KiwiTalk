import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: inline-block
`;

interface PhotoChatProps {
  width: number,
  height: number,
  url: string,
  ratio: number,
  limit: number[],
}

const resize = (width: number, height: number, customRatio: number = -1, limit = [300, 500]) => {
  const ratio = customRatio <= 0 ? width / height : customRatio;
  let [w, h] = [width, height];

  w = Math.min(limit[0], width)
  h = 1 / ratio * w

  if (height > limit[1]) {
    h = Math.min(limit[1], height)
    w = ratio * h
  }
  console.log(ratio, w, h)
  return [w, h]
}

export const PhotoChat: React.FC<PhotoChatProps> = (chat: PhotoChatProps) => {
  return (
    <Wrapper>
      {
        (() => {
          const [w, h] = resize(chat.width, chat.height, chat.ratio, chat.limit)

          // eslint-disable-next-line jsx-a11y/alt-text
          return <img src={chat.url} style={{ width: w + 'px', height: h + 'px' }} />
        })()
      }
    </Wrapper>
  );
};

export default PhotoChat;
