import React from 'react';
import styled from 'styled-components';
import bubbleTail from '../../assets/images/bubble_tail.svg'

const BubbleTail = styled.img`
  margin-bottom: 5px;
`;

const FakeTail = styled.div`
  padding-left: 16px;
  height: 100%;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  margin-top: 7px;
`;

const Content = styled.div`
  background: #FFFFFF;
  border-radius: 5px;
  padding: 9px 47px 9px 18px;
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
  color: #000000;
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
  color: #808080;
`;

const Author = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 17px;
  color: #178DB4;
  margin-top: -4px;
`;

export interface BubbleProps {
  hasTail: boolean,
  author?: string,
  time?: string
}

const Bubble: React.FC<BubbleProps> = ({hasTail, author, time, children}) => {
  return (
    <Wrapper>
      {hasTail ? <BubbleTail src={bubbleTail}/> : <FakeTail/>}
      <Content>
        {author && <Author>{Author}</Author>}
        {children}
      </Content>
      {time && <Date>{time}</Date>}
    </Wrapper>
  );
};

export default Bubble;
