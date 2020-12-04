import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 9999px;
  color: black;
  padding: 4px;

  margin: 16px 8px 8px 8px;
`;

const Content = styled.span`
  text-align: center;
  margin: 8px;
`;

interface InviteProps {
  invitee: string
  inviter: string | null
}

export const Invite: React.FC<InviteProps> = ({ invitee, inviter }) => {
  return (
    <Wrapper>
      {
        inviter == null ? <Content>{invitee}님이 들어왔습니다.</Content> : <Content>{inviter}님이 {invitee}님을 초대하였습니다.</Content>
      }
    </Wrapper>
  );
};

export default Invite;
