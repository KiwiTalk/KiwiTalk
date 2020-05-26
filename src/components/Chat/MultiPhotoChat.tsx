import React from 'react';
import styled from 'styled-components';

import PhotoChat, { PhotoChatProps } from './PhotoChat';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;
  gap: 8px;
`;

interface MultiPhotoChatProps {
    datas: PhotoChatProps[]
}

function fitData (length: number) {
    switch(length) {
        case 1: case 2: case 3:
            return [length, 1]
        case 4:
            return [2, 2]
        default:
            return [3, Math.ceil(length / 3)]
    }
}

export const MultiPhotoChat: React.FC<MultiPhotoChatProps> = ({ datas }) => {
    const [columns, rows] = fitData(datas.length)

    const style = {
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
    }

    return ( // 이거 grid 장인님께서 적당히 맞춰주세요
        <Wrapper style={style}>
            {
                datas.map((data: PhotoChatProps) => {
                    return <div style={{ display: 'grid-item' }}>
                        <PhotoChat
                            width={data.width}
                            height={data.height}
                            url={data.url}
                            ratio={1}
                            limit={[200, 200]} />
                    </div>
                })
            }
        </Wrapper>
    );
};

export default MultiPhotoChat;
