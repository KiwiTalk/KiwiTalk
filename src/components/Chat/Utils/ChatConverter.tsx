import React from "react";

import {
    Chat,
    ChatType,
    PhotoAttachment,
    ReplyAttachment,
    ReplyChat as ReplyChatObject,
    VideoAttachment,
    FeedType
} from "node-kakao";

import Photo, { PhotoChatProps } from '../Type/Photo';
import MultiPhoto from '../Type/MultiPhoto';
import SearchChat from '../Type/SearchChat';
import Reply from '../Type/Reply';
import Location from '../Type/Location';
import Video from '../Type/Video';
import LongText from '../Type/LongText';
import DeletedText from "../Type/DeletedText";
import styled from "styled-components";

import convertFeed from "./FeedConverter";

const Content = styled.span`
    white-space: pre-line;
`;

export function toText (chat: Chat) {
    return <Content style={{ whiteSpace: 'pre-line' }}>{chat.Text}</Content>
}

export function toLongText (chat: Chat) {
    return <LongText chat={chat}></LongText>
}

export function toPhoto (chat: Chat, options = { ratio: -1, limit: [300, 500] }) {
    const list = chat.AttachmentList.map((attachment: any) => {
        attachment = attachment as PhotoAttachment;

        return <Photo
            width={attachment.Width}
            height={attachment.Height}
            url={attachment.ImageURL}
            ratio={options.ratio}
            limit={options.limit}></Photo>
    })

    return <div style={{ display: 'flex' }}>{list}</div>
}

export function toPhotos (chat: Chat) {
    const datas = chat.AttachmentList.map((attachment: any) => {
        attachment = attachment as PhotoAttachment;

        return {
            width: attachment.Width,
            height: attachment.Height,
            url: attachment.ImageURL,
            ratio: -1,
            limit: [200, 200]
        } as PhotoChatProps
    })

    return <MultiPhoto datas={datas} />
}

export function toVideo (chat: Chat) {
    const list = chat.AttachmentList.map((attachment: any) => {
        attachment = attachment as VideoAttachment;

        return <Video
            url={attachment.VideoURL}
            width={attachment.Width}
            height={attachment.Height}
            duration={attachment.Duration} />
    })

    return <div>{list}</div>
}

export function toSearch (chat: Chat) {
    const list = chat.AttachmentList.map((attachment: any) => {
        const { Question, ContentType, ContentList } = attachment;

        return <SearchChat question={Question} type={ContentType} list={ContentList}></SearchChat>
    })

    return <div>{list}</div>
}

export function toReply (chat: Chat, chatList: Chat[]) {
    let prevChat = null;
    const attachments = (chat as ReplyChatObject).AttachmentList as ReplyAttachment[]
    const prevId = attachments[0].SourceLogId.toString()

    for (const c of chatList) {
        if (c.LogId.toString() === prevId.toString()) {
            prevChat = c;
            break;
        }
    }

    if (prevChat != null) {
        return <Reply prevChat={prevChat} me={chat}></Reply>
    } else {
        return <span>{chat.Text}</span>
    }
}

export function toMap (chat: Chat) {
    const list = chat.AttachmentList.map((attachment: any) => {
        const { Name, Lat, Lng } = attachment

        return <Location name={Name} url={''} latitude={Lat} longitude={Lng}></Location>
    })

    return <div>{list}</div>
}

export function toDeletedText (chat: Chat, chatList: Chat[]) {
    return <DeletedText chat={chat} chatList={chatList}></DeletedText>
}

export function convertChat (chat: Chat, chatList: Chat[]) {
    switch (chat.Type) {
        case ChatType.Feed:
            return convertFeed(chat, chatList);
        case ChatType.Text:
            if (chat.Text.length > 500) return toLongText(chat);
            else return toText(chat);
        case ChatType.Photo:
            return toPhoto(chat);
        case ChatType.MultiPhoto:
            return toPhotos(chat);
        case ChatType.Video:
            return toVideo(chat);
        case ChatType.Search:
            return toSearch(chat);
        case ChatType.Reply:
            return toReply(chat, chatList);
        case ChatType.Unknown:
            try {
                const content = JSON.parse(chat.Text);
                console.log(content)
                if (content.feedType !== FeedType.UNDEFINED) {
                    return convertFeed(chat, chatList, { feed: content });
                }
            } catch (err) { console.log(chat.Text, err) }

            return <span>{chat.Text}</span>
        case ChatType.Map:
        default:
            return <div>
                <h5>{chat.Type}</h5>
                <span>{chat.Text}</span>
            </div>
    }
}

export default convertChat;
