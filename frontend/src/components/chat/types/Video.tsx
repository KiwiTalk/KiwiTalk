import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: inline-block
`;

interface VideoChatProps {
    width: number,
    height: number,
    url: string,
    duration: number,
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

export const Video: React.FC<VideoChatProps> = (data: VideoChatProps) => {
  return (
    <Wrapper>
      {
        (() => {
          const [w, h] = resize(data.width, data.height);

          return <video style={{ width: w + 'px', height: h + 'px' }}>
            <source src={data.url}/>
          </video>;
        })()
      }
    </Wrapper>
  );
};

export default Video;
