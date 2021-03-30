import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import { ExpandMore } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import KakaoManager from '../../KakaoManager';
import { ReducerType } from '../../reducers';
import { KnownChannelMetaType } from 'node-kakao/dist/channel/meta';

const NoticeAccordion = styled(Accordion)`
  position: absolute;
  z-index: 2;
  width: 100%;
  box-shadow: rgba(0, 0, 0, 0.5) 0 3px 6px;

  &.MuiAccordion-root.Mui-expanded {
    margin-top: 1px;
  }
`;

const NoticeAccordionSummary = styled(AccordionSummary)`
  .MuiAccordionSummary-content {
  
    width: calc(100% - 36px);
  }
`;

const NoticeTypography = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ChatNotice = (): JSX.Element | null => {
  const select = useSelector((state: ReducerType) => state.chat.select);

  const noticeContent = KakaoManager
      .getChannel(select)
      .info
      .metaMap[KnownChannelMetaType.NOTICE]
      .content;

  const [isExpanded, setExpanded] = useState(false);

  if (noticeContent) {
    return (
      <NoticeAccordion expanded={isExpanded} onChange={(event, expanded) => {
        setExpanded(expanded);
      }}>
        <NoticeAccordionSummary expandIcon={<ExpandMore />}>
          <NoticeTypography>{isExpanded ? '공지' : `공지: ${noticeContent}`}</NoticeTypography>
        </NoticeAccordionSummary>
        <AccordionDetails>
          <Typography>{noticeContent}</Typography>
        </AccordionDetails>
      </NoticeAccordion>
    );
  } else {
    return null;
  }
};

export default ChatNotice;
