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

const Content = styled.div((props: { isMine: boolean, hasPadding: boolean, hasAuthor: boolean }) => `
  background: ${props.isMine ? color.BLUE_700 : color.GREY_900};
  ${props.hasPadding ? `padding: 8px 8px 8px 8px;` : ''}
  border-radius: 5px;
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
  color: ${color.GREY_100};
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  overflow: hidden;

  max-width: 70%;
`);

const Author = styled.span((props: { hasPadding: boolean }) => `
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 17px;
  color: ${color.BLUE_300};
  padding: ${props.hasPadding ? '0' : '8'}px ${props.hasPadding ? '0' : '8'}px ${props.hasPadding ? '0' : '8'}px ${props.hasPadding ? '0' : '8'}px;
`);

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

const Unread = styled.span((props: { isMine: boolean }) => `
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 11px;
  margin: 0px 12px;
  text-align: ${props.isMine ? 'right' : 'left'};
  color: ${color.BLUE_400};
`);

export interface BubbleProps {
    hasTail: boolean
    author?: string
    time: Date
    unread: number
    isMine: boolean
    hasPadding: boolean
}

const convertTime = (time: Date, use24format = true) => {
    const hour = time.getHours();
    const minute = time.getMinutes();

    let hourStr = use24format ? hour.toString() : hour < 12 ? `오전 ${hour === 0 ? 12 : hour}` : `오후 ${hour === 12 ? hour : hour - 12}`;

    return `${hourStr}:${minute < 10 ? `0${minute}` : minute}`
}

const Bubble: React.FC<BubbleProps> = ({hasTail, author, time, unread, isMine, children, hasPadding}) => {
    const hasAuthor = !!(!isMine && author)
    return (
        <Wrapper isMine={isMine}>
            {hasTail ? <BubbleTail src={isMine ? bubbleTailMine : bubbleTail}/> : <FakeTail/>}
            <Content isMine={isMine} hasAuthor={hasAuthor} hasPadding={hasPadding}>
                {hasAuthor ? <Author hasPadding={hasPadding}>{author}</Author> : hasPadding}
                {children}
            </Content>
            <HeadWrapper>
                <Unread isMine={isMine}>{unread}</Unread>
                <Date>{convertTime(time, false)}</Date>
            </HeadWrapper>
        </Wrapper>
    );
};

export default Bubble;
