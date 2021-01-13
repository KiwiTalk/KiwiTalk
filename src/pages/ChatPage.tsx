import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Long } from 'bson';
import { Chat as ChatObject, ChatChannel, MoreSettingsStruct } from 'node-kakao';
import { PacketSyncMessageReq, PacketSyncMessageRes } from 'node-kakao/dist/packet/packet-sync-message';
import React, { ChangeEvent, FormEvent, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AppContext } from '../App';
import ChatRoom from '../components/chat/chatroom/ChatRoom';
import EmptyChatRoom from '../components/chat/chatroom/EmptyChatRoom';
import SideBar from '../components/common/sidebar/SideBar';
import SidePanel from '../components/common/sidebar/SidePanel';
import constants from '../constants';
import Strings from '../constants/Strings';
import KakaoManager from '../KakaoManager';
import { ReducerType } from '../reducers';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  padding-top: ${(() => {
    switch (process.platform) {
      case 'darwin':
      case 'cygwin':
      case 'win32':
        return 20;
      default:
        return 0;
    }
  })()}px;
`;

const makeTemplate = constants.ChatModule.makeTemplate;

const records: boolean[] = [];

interface AlertData {
  isShow: boolean;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | undefined;
}

const ChatPage = (): JSX.Element => {
  const { select } = useSelector((state: ReducerType) => state.chat);
  const [snack, setSnack] = useState<AlertData>({
    isShow: false,
    message: '',
    type: undefined,
  });
  const [empty, setEmpty] = useState(true);

  const [accountSettings, setAccountSettings] = useState<MoreSettingsStruct>();

  const { client } = useContext(AppContext);

  KakaoManager.init(client).then();

  useEffect(() => {
    (async () => {
      try {
        const settings = await client.Auth.requestMoreSettings();
        setAccountSettings(settings);
      } catch (error) {
        setSnack({
          isShow: true,
          message: `${Strings.Error.UNKNOWN}\n${error.toString()}`,
          type: 'error',
        });
      }
    })();
  });

  useEffect(() => {
    try {
      KakaoManager.getChannel(select);

      setEmpty(false);
    } catch {
      return;
    }
  }, [select]);

  return (
    <Wrapper>
      <SideBar/>
      <SidePanel accountSettings={accountSettings} />
      {
        empty ?
          <EmptyChatRoom/> :
          <ChatRoom />
      }
      <Snackbar
        open={snack.isShow}
        autoHideDuration={2000}
        onClose={() => setSnack({
          isShow: false,
          message: snack.message,
          type: snack.type,
        })}>
        <Alert
          onClose={() => setSnack({
            isShow: false,
            message: snack.message,
            type: snack.type,
          })}
          severity={snack.type}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Wrapper>
  );
};

export default ChatPage;
