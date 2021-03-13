import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Chat } from 'node-kakao';
import getMetadata from '../../../utils/getMetadata';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const BoxWrapper = styled.div`
  display: flex;
  flex-direction: row;

  overflow-x: auto;
  overflow-y: hidden;
`;

const Box = styled.div`
  width: 100px;

  padding: 8px;
  margin: 8px;
  border-radius: 4px;

  background-color: rgba(0, 0, 0, 0.1);

  cursor: pointer;
`;

const Thumbnail = styled.img`
  width: 100px;
  height: auto;
  object-fit: contain;

  border-radius: 4px;
`;

const Text = styled.div`
  width: 100px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Description = styled(Text)`
  color: #808080;
`;

const Url = styled(Text)`
  color: #00A4FF;
`;

type LinkData = {
  image: string;
  title: string;
  description: string;
  url: string;
};

export interface LinkTextProps {
  chat: Chat;
}

export const Link: React.FC<LinkTextProps> = ({ chat }) => {
  const [list, setList] = useState<LinkData[]>([]);

  const text = chat.Text;
  const urls = (Array.from(
      new Set([
        text.match(/(\w)+:\/\/[\w.:/?&\-+=%]+/g),
        text.match(/[\w:/?&\-+=%]+(\.[\w:/?&\-+=%]+)+/g),
      ].flat().filter((it) => !!it)),
  ) as string[]);

  useEffect(() => {
    Promise.all(
        urls.map(
            (url) => getMetadata(url?.toString() ?? ''),
        ),
    ).then((data) => {
      const result = data.filter((it) => it.url).filter(
          ({ url }, i) => data.slice(i + 1).every(
              ({ url: url2 }) => url !== url2,
          ),
      );

      setList(result);
    });
  }, []);

  const regexUrls = urls.map((url) => url.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'));
  const textList = text.split(new RegExp(regexUrls.join('|')));
  return (
    <Wrapper>
      <div>
        {
          textList.map((resource, i) => {
            if (i <= textList.length) {
              return <span key={`link-span-${urls[i]}-${i}`}>
                {resource}
                <a style={{
                  color: '#00A4FF',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}>{urls[i]}</a>
              </span>;
            }
            return <span>{resource}</span>;
          })
        }
      </div>
      <BoxWrapper>
        {
          list.map(({ image, title, description, url }) => {
            return <Box key={`link-${title}-${url}`}>
              {image ? <Thumbnail src={image}/> : null}
              {title ? <Text>{title}</Text> : null}
              {description ? <Description>{description}</Description> : null}
              {url ? <Url>{url}</Url> : null}
            </Box>;
          })
        }
      </BoxWrapper>
    </Wrapper>
  );
};

export default Link;
