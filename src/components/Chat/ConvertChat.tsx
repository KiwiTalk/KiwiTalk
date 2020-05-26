import { Chat, ChatType, PhotoAttachment, VideoAttachment, ReplyAttachment, ReplyChat as ReplyChatObject } from "node-kakao";

import PhotoChat, { PhotoChatProps } from './PhotoChat';
import MultiPhotoChat from './MultiPhotoChat';
import SearchChat from './SearchChat';
import ReplyChat from './ReplyChat';
import MapChat from './MapChat';
import VideoChat from './VideoChat';
import React from "react";

export function toText (chat: Chat) {
    return <span>{chat.Text}</span>
}

export function toPhoto (chat: Chat, options = { ratio: -1, limit: [300, 500]}) {
    const list = chat.AttachmentList.map((attachment: any) => {
        attachment = attachment as PhotoAttachment;

        return <PhotoChat
            width={attachment.Width}
            height={attachment.Height}
            url={attachment.ImageURL}
            ratio={options.ratio}
            limit={options.limit}></PhotoChat>
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

    return <MultiPhotoChat datas={datas} />
}

export function toVideo (chat: Chat) {
    const list = chat.AttachmentList.map((attachment: any) => {
        attachment = attachment as VideoAttachment;
        
        return <VideoChat
            url={attachment.VideoURL}
            width={attachment.Width}
            height={attachment.Height}
            duration={attachment.Duration} />
    })

    return <div>{list}</div>
}

export function toSearch(chat: Chat) {
    const list = chat.AttachmentList.map((attachment: any) => {
        const { Question, ContentType, ContentList } = attachment;

        return <SearchChat question={Question} type={ContentType} list={ContentList}></SearchChat>
    })

    return <div>{list}</div>
}

export function toReply(chat: Chat, chatList: Chat[]) { 
    let prevChat = null;
    const attachments = (chat as ReplyChatObject).AttachmentList as ReplyAttachment[]
    const prevId = attachments[0].SourceLogId.toString()
    console.log(chat as ReplyChatObject)

    for (const c of chatList) {
        if (c.LogId.toString() === prevId.toString()) {
            prevChat = c;
            break;
        }
    }

    if (prevChat != null) {
        return <ReplyChat prevChat={prevChat} me={chat}></ReplyChat>
    } else {
        return <span>{chat.Text}</span>
    }
}

export function toMap(chat: Chat) {
    const list = chat.AttachmentList.map((attachment: any) => {
        const { Name, Lat, Lng } = attachment
        
        return <MapChat name={Name} url={''} latitude={Lat} longitude={Lng}></MapChat>
    })

    return <div>{list}</div>
}

export function convertContent (chat: Chat, chatList: Chat[]) {
    switch (chat.Type) {
        case ChatType.Text:
            return toText(chat);
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
        case ChatType.Map:
        default:
            return <div>
                <h5>{chat.Type}</h5>
                <span>{chat.Text}</span>
            </div>
    }
}

export default convertContent;
