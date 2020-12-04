import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import styled from 'styled-components';
import SidePanel from '../components/common/side-bar/side-panel';
import SideBar from '../components/common/side-bar/side-bar';
import {Chat as ChatObject, ChatChannel, ChatType, MoreSettingsStruct, TalkClient, TalkPacketHandler} from 'node-kakao';
import {PacketSyncMessageRes} from 'node-kakao/dist/packet/packet-sync-message';
import ChatRoom from '../components/chat/chat-room/chat-room';
import {Long} from "bson";
import EmptyChatRoom from '../components/chat/chat-room/empty-chat-room';

const Wrapper = styled.div`
width: 100%;
height: 100vh;
box-sizing: border-box;
display: flex;
flex-direction: row;
padding-top: ${(() => {
    switch ((nw as any).process.platform) {
        case 'darwin':
        case 'cygwin':
        case 'win32':
            return 20;
        default:
            return 0;
    }
})()}px;
`;

const talkClient: TalkClient = (nw as any).global.talkClient;

const makeTemplate = (nw as any).global.makeTemplate;

let records: boolean[] = [];

const Chat = () => {
    const [channelList, setChannelList] = useState<ChatChannel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState(-1);
    const [accountSettings, setAccountSettings] = useState<MoreSettingsStruct>();
    const [chatList, setChatList] = useState<ChatObject[]>([]);
    const [inputText, setInputText] = useState('');

    const messageHook = (chat: ChatObject) => {
        setChatList((prev) => [...prev, chat]);
    }

    useEffect(() => {
        channelList.forEach(async (channel, index) => {
            if (index !== selectedChannel) return;
            if (records[index]) return;
            let LastChat = channel.LastChat as ChatObject;
            //setChatList((prev) => [LastChat]);

            let e = talkClient.NetworkManager.Handler as TalkPacketHandler, f = 0;
            let lastTokenId = channel.LastChat?.LogId as Long;
            //e.on("MCHATLOGS", (pk) => console.log(pk));
            e.on("SYNCMSG", async (pk: PacketSyncMessageRes) => {
                if (f) return;
                f = 1;
                if (pk.ChatList.length < 1) return;
                let startId = pk.ChatList[0].prevLogId;
                let update: ChatObject[] = [];
                do {
                    let chatLog = (await talkClient.ChatManager.getChatListFrom(channel.Id, startId)).result as ChatObject[];
                    console.log(chatLog);
                    if (chatLog.length > 0) {
                        update.push(...chatLog);
                        if (chatLog.length > 0 && startId.notEquals(chatLog[chatLog.length - 1].LogId)) {
                            startId = chatLog[chatLog.length - 1].LogId;
                            continue;
                        }
                    }
                    break;
                } while (true);
                setChatList((prev) => [...prev, ...update]);
            });
            await talkClient.ChatManager.getChatListBetween(channel.Id, Long.fromString("1"), 1, lastTokenId);

            records[index] = true;
        });
    }, [selectedChannel]);

    useEffect(() => {
        (async () => {
            const list: ChatChannel[] = talkClient.ChannelManager.getChannelList()
                .map((chatChannel) => talkClient.ChannelManager.get(chatChannel.Id)) as ChatChannel[];

            setChannelList(list);

            try {
                const settings = await talkClient.Auth.requestMoreSettings();
                setAccountSettings(settings);
            } catch (error) {
                alert("오류가 발생했습니다.\n" + error);
            }

            talkClient.on('message', messageHook);
        })();
    }, []);

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    }

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        const channel = channelList[selectedChannel];
        if (!channel?.Id) return;
        if (inputText.length <= 0) return;

        if (inputText[0] === '/') {
            const cmd = inputText.split(/\s/g);
            switch (cmd[0]) {
                case '/photo':
                    makeTemplate(ChatType.Photo, cmd[1])
                        .then((template: any) => {
                            channel.sendTemplate(template)
                                .then(result => {
                                    if (!(result instanceof ChatObject)) throw new Error();
                                    setInputText('');

                                    messageHook(result);
                                })
                                .catch((error: any) => {
                                    alert(`메시지 발송 중 오류 발생 ${error}`);
                                });
                        })
                    break;
                case '/video':
                    makeTemplate(ChatType.Video, cmd[1])
                        .then((template: any) => {
                            channel.sendTemplate(template)
                                .then(result => {
                                    if (!(result instanceof ChatObject)) throw new Error();
                                    setInputText('');

                                    messageHook(result);
                                })
                                .catch((error: any) => {
                                    alert(`메시지 발송 중 오류 발생 ${error}`);
                                });
                        })
                    break;
                case '/file':
                    makeTemplate(ChatType.File, cmd[1])
                        .then((template: any) => {
                            channel.sendTemplate(template)
                                .then(result => {
                                    if (!(result instanceof ChatObject)) throw new Error();
                                    setInputText('');

                                    messageHook(result);
                                })
                                .catch((error: any) => {
                                    alert(`메시지 발송 중 오류 발생 ${error}`);
                                });
                        })
                    break;
            }
        } else {
            channel.sendText(inputText)
                .then(result => {
                    if (!(result instanceof ChatObject)) throw new Error();
                    setInputText('');

                    messageHook(result);
                })
                .catch((error: any) => {
                    alert(`메시지 발송 중 오류 발생 ${error}`);
                });
        }
    }

    return (
        <Wrapper>
            <SideBar />
            <SidePanel
                channelList={channelList}
                accountSettings={accountSettings}
                onChange={async (selectedChannel) => {
                    setSelectedChannel(selectedChannel);
                    if (!channelList[selectedChannel]) return;
                    await (nw as any).global.chat.chatOn(selectedChannel);
                }} />
            {
                channelList[selectedChannel]
                    ? <ChatRoom
                        channel={channelList[selectedChannel]}
                        chatList={chatList.filter((chat) => chat.Channel.Id.toString() === channelList[selectedChannel].Id.toString())}
                        onInputChange={onChange}
                        onSubmit={onSubmit} inputValue={inputText} />
                    : <EmptyChatRoom />
            }
        </Wrapper>
    );
};

export default Chat;
