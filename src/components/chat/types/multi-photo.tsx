import React from 'react';
import styled from 'styled-components';

import Photo, {PhotoChatProps} from './photo';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;
  gap: 8px;
`;

interface MultiPhotoChatProps {
    datas: PhotoChatProps[]
}

function fitData (length: number, index: number) {
    let model = {
        gridArea: '1 / 1 / span 1 / span 1'
    }

    switch (length % 3) {
        case 0:
            model.gridArea = `${Math.ceil((index + 1) / 3)} / ${(index % 3) * 2 + 1} / span 1 / span 2`;
            break;
        case 1:
            if (index <= 1 || length - 2 <= index) {
                model.gridArea = `${index <= 1 ? 1 : 1 + Math.ceil((length - 2) / 3)} / ${(index === 0 || index === length - 1) ? 1 : 4} / span 1 / span 3`;
            } else {
                index += 1
                model.gridArea = `${Math.ceil((index + 1) / 3)} / ${(index % 3) * 2 + 1} / span 1 / span 2`;
            }
            break;
        case 2:
            if (index <= 1) {
                model.gridArea = `1 / ${index === 0 ? 1 : 4} / span 1 / span 3`;
            } else {
                index += 1
                model.gridArea = `${Math.ceil((index + 1) / 3)} / ${(index % 3) * 2 + 1} / span 1 / span 2`;
            }
            break;
    }

    return model;
}

export const MultiPhoto: React.FC<MultiPhotoChatProps> = ({datas}) => {
    const style = {
        width: 'auto',
    }

    return (
        <Wrapper style={style}>
            {
                datas.map((data: PhotoChatProps, i: number) => {
                    const isTwo = ((datas.length % 3 === 1) && (i <= 1 || datas.length - 2 <= i)) || ((datas.length % 3 === 2) && (i <= 1))

                    return <div style={{
                        display: 'grid-item',
                        ...fitData(datas.length, i),
                    }}>
                        <Photo
                            width={data.width}
                            height={data.height}
                            url={data.url}
                            ratio={isTwo ? 1.5 : 1}
                            limit={isTwo ? [300, 200] : [200, 200]}/>
                    </div>
                })
            }
        </Wrapper>
    );
};

export default MultiPhoto;
