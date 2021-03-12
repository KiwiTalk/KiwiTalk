import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const MapItemName = styled.div`
  color: #808080;
  text-overflow: ellipsis;
  overflow: hidden;
`;
const MapItemImage = styled.img`
  float: right;
  margin: 8px;
`;

interface MapChatProps {
    url: string,
    name: string,
    longitude: string,
    latitude: string,
}

export const Location: React.FC<MapChatProps> = (data: any) => {
  return (
    <Wrapper>
      <MapItemImage src={data.url}/>
      <MapItemName>{data.name}</MapItemName>
    </Wrapper>
  );
};

export default Location;
