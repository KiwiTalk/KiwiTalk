import React from 'react';
import styled from 'styled-components';
import bubbleTail from '../../assets/images/bubble_tail.svg'
import bubbleTailMine from '../../assets/images/bubble_tail_mine.svg'
import color from '../../assets/colors/theme';

const BubbleTail = styled.img`
  margin-bottom: 5px;
  width: 16px;
`;

const FakeTail = styled.div`
  padding-left: 16px;
  height: 100%;
`;

const Wrapper = styled.div((props: { isMine: boolean }) => `
  display: flex;
  flex-direction: ${props.isMine ? 'row-reverse' : 'row'};
  align-items: flex-end;
  margin-top: 7px;
  justify-content: 'flex-start';
`);

const Content = styled.div((props: { isMine: boolean }) => `
  background: ${props.isMine ? color.BLUE_700 : color.GREY_900};
  border-radius: 5px;
  padding: 9px 47px 9px 18px;
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
  color: ${color.GREY_100};
  display: flex;
  flex-direction: column;
`);

const Author = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 17px;
  color: ${color.BLUE_300};
  margin-top: -4px;
`;

const HeadWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Date = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
  margin: 0px 12px;
  color: ${color.GREY_400};
`;

const Unread = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 11px;
  margin: 0px 12px;
  color: ${color.BLUE_400};
`

export interface BubbleProps {
    hasTail: boolean
    author?: string
    time: Date
    unread: number
    isMine: boolean
}

const convertTime = (time: Date, use24format = true) => {
    const hour = time.getHours();
    const minute = time.getMinutes();

    let hourStr = use24format ? hour.toString() : hour < 12 ? `오전 ${hour === 0 ? 12 : hour}` : `오후 ${hour === 12 ? hour : hour - 12}`;

    return `${hourStr}:${minute < 10 ? `0${minute}` : minute}`
}

const Bubble: React.FC<BubbleProps> = ({hasTail, author, time, unread, isMine, children}) => {
    return (
        <Wrapper isMine={isMine}>
            {hasTail ? <BubbleTail src={isMine ? bubbleTailMine : bubbleTail}/> : <FakeTail/>}
            <Content isMine={isMine}>
                {author && <Author>{author}</Author>}
                {children}
            </Content>
            <HeadWrapper>
                <Unread>{unread}</Unread>
                <Date>{convertTime(time, false)}</Date>
            </HeadWrapper>
        </Wrapper>
    );
};

export default Bubble;
