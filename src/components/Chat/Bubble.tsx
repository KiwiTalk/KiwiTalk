import React from 'react';
import styled from 'styled-components';
import bubbleTail from '../../assets/images/bubble_tail.svg'
import color from '../../assets/javascripts/color';

const BubbleTail = styled.img`
  margin-bottom: 5px;
`;

const FakeTail = styled.div`
  padding-left: 16px;
  height: 100%;
`;

const Wrapper = styled.div((props: {isMine: boolean}) => `
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  margin-top: 7px;
  justify-content: ${props.isMine ? 'flex-end' : 'flex-start'};
`);

const Content = styled.div`
  background: ${color.GREY_900};
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
`;

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
  margin-left: 12px;
  color: ${color.GREY_400};
`;

const Unread = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
  margin-left: 12px;
  color: ${color.BLUE_400};
`

export interface BubbleProps {
  hasTail: boolean
  author?: string
  time: string
  unread: number
  isMine: boolean
}

const Bubble: React.FC<BubbleProps> = ({hasTail, author, time, unread, isMine, children}) => {
  console.log('a');
  return (
    <Wrapper isMine={isMine}>
      {hasTail && !isMine ? <BubbleTail src={bubbleTail}/> : <FakeTail/>}
      <Content>
        {author && <Author>{author}</Author>}
        {children}
      </Content>
      {hasTail && isMine ? <BubbleTail style={{transform: 'scaleX(-1)'}} src={bubbleTail}/> : <FakeTail/>}
      <HeadWrapper>
        <Unread>{unread}</Unread>
        <Date>{time}</Date>
      </HeadWrapper>
    </Wrapper>
  );
};

export default Bubble;
