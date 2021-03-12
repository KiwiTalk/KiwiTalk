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

interface FileProps {
  member: string
}

export const File: React.FC<FileProps> = ({ member }) => {
  return (
    <Wrapper>
      <Content>{member}님이 나갔습니다.</Content>
    </Wrapper>
  );
};

export default File;
