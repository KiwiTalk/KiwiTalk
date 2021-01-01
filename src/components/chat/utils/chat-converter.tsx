import React from 'react';

import {
  Chat,
  ChatType,
  FeedType,
  PhotoAttachment,
  ReplyAttachment,
  ReplyChat as ReplyChatObject,
  VideoAttachment,
} from 'node-kakao';

import Photo, { PhotoChatProps } from '../types/photo';
import MultiPhoto from '../types/multi-photo';
import Search from '../types/search';
import Reply from '../types/reply';
import Location from '../types/location';
import Video from '../types/video';
import Long from '../types/long';
import Deleted from '../types/deleted';
import styled from 'styled-components';

import convertFeed from './feed-converter';
import { isUrl } from '../../../utils/is-url';
import Link from '../types/link';

const Content = styled.span`
  white-space: pre-line;
`;

const ShortContent = styled.span`
  color: #424242;
`;

export function toText(chat: Chat): JSX.Element {
  if (isUrl(chat.Text)) {
    return <Link chat={chat}/>;
  }
  return <Content>{chat.Text}</Content>;
}

export function toLongText(chat: Chat): JSX.Element {
  return <Long chat={chat}/>;
}

export function toPhoto(
    chat: Chat,
    options = {
      ratio: -1,
      limit: [300, 500],
    },
): JSX.Element {
  const list = chat.AttachmentList.map((attachment: any) => {
    attachment = attachment as PhotoAttachment;

    return <Photo
      width={attachment.Width}
      height={attachment.Height}
      url={attachment.ImageURL}
      ratio={options.ratio}
      limit={options.limit}/>;
  });

  return <div style={{ display: 'flex' }}>{list}</div>;
}

export function toPhotos(chat: Chat): JSX.Element {
  const data = chat.AttachmentList.map((attachment: any) => {
    attachment = attachment as PhotoAttachment;

    return {
      width: attachment.Width,
      height: attachment.Height,
      url: attachment.ImageURL,
      ratio: -1,
      limit: [200, 200],
    } as PhotoChatProps;
  });

  return <MultiPhoto photoChatProps={data}/>;
}

export function toVideo(chat: Chat): JSX.Element {
  const list = chat.AttachmentList.map((attachment: any) => {
    attachment = attachment as VideoAttachment;

    return <Video
      url={attachment.VideoURL}
      width={attachment.Width}
      height={attachment.Height}
      duration={attachment.Duration}/>;
  });

  return <div>{list}</div>;
}

export function toSearch(chat: Chat): JSX.Element {
  const list = chat.AttachmentList.map((attachment: any) => {
    const { Question, ContentType, ContentList } = attachment;

    return <Search question={Question} type={ContentType} list={ContentList}/>;
  });

  return <div>{list}</div>;
}

export function toReply(chat: Chat, chatList: Chat[]): JSX.Element {
  let prevChat = null;
  const attachments = (chat as ReplyChatObject)
      .AttachmentList as ReplyAttachment[];
  const prevId = attachments[0].SourceLogId.toString();

  for (const c of chatList) {
    if (c.LogId.toString() === prevId.toString()) {
      prevChat = c;
      break;
    }
  }

  if (prevChat != null) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return <Reply prevChat={prevChat} me={chat} onClick={() => {
    }}/>;
  } else {
    return <span>{chat.Text}</span>;
  }
}

export function toMap(chat: Chat): JSX.Element {
  const list = chat.AttachmentList.map((attachment: any) => {
    const { Name, Lat, Lng } = attachment;

    return <Location name={Name} url={''} latitude={Lat} longitude={Lng}/>;
  });

  return <div>{list}</div>;
}

export function toDeletedText(chat: Chat, chatList: Chat[]): JSX.Element {
  return <Deleted chat={chat} chatList={chatList}/>;
}

export function convertChat(
    chat: Chat,
    chatList: Chat[],
): JSX.Element | undefined {
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
        console.log(content);
        if (content.feedType !== FeedType.UNDEFINED) {
          return convertFeed(chat, chatList, { feed: content });
        }
      } catch (err) {
        console.log(chat.Text, err);
      }

      return <span>{chat.Text}</span>;
    case ChatType.Map:
    default:
      return <div>
        <h5>{chat.Type}</h5>
        <span>{chat.Text}</span>
      </div>;
  }
}

export function convertShortChat(chat: Chat): JSX.Element {
  switch (chat.Type) {
    case ChatType.Feed:
    case ChatType.Text:
    case ChatType.Reply:
      return <ShortContent>{
        `${
          chat.Text.substring(0, 25)
        }${
          chat.Text.length >= 25 ? '...' : ''
        }`
      }</ShortContent>;
    case ChatType.Photo:
    case ChatType.MultiPhoto:
      return toPhoto(chat, {
        ratio: 1,
        limit: [50, 50],
      });
    case ChatType.Video:
      return <ShortContent>동영상</ShortContent>;
    case ChatType.Search:
      return <ShortContent>{`샵검색: ${chat.Text}`}</ShortContent>;
    case ChatType.Map:
    default:
      return <div>
        <h5>{chat.Type}</h5>
        <span>{chat.Text}</span>
      </div>;
  }
}

export default convertChat;
