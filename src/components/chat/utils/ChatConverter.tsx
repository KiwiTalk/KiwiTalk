import {
  Chatlog,
  TalkChannel,
  KnownChatType,
  PhotoAttachment,
  ReplyAttachment,
  VideoAttachment, Chatlog,
} from 'node-kakao';
import React from 'react';
import styled from 'styled-components';
import { isUrl } from '../../../utils/isUrl';
import Deleted from '../types/Deleted';
import Emoticon from '../types/Emoticon';
import Link from '../types/Link';
import Location from '../types/Location';
import Long from '../types/Long';
import MultiPhoto from '../types/MultiPhoto';

import Photo, { PhotoChatProps } from '../types/Photo';
import Reply from '../types/Reply';
import Search from '../types/Search';
import Video from '../types/Video';

import convertFeed from './FeedConverter';

const Content = styled.span`
  white-space: pre-line;
`;

const ShortContent = styled.span`
  color: #424242;
`;

export function toText(chat: Chatlog): JSX.Element {
  return <Content>{convertText(chat)}</Content>;
}

export function toLongText(chat: Chatlog): JSX.Element {
  return <Long chat={chat}/>;
}

export function toPhoto(
    chat: Chatlog,
    options = {
      ratio: -1,
      limit: [300, 500],
    },
): JSX.Element {
  const list = chat.AttachmentList.map((attachment: any) => {
    attachment = attachment as PhotoAttachment;

    return <Photo
      key={attachment.ImageURL}
      width={attachment.Width}
      height={attachment.Height}
      url={attachment.ImageURL}
      ratio={options.ratio}
      limit={options.limit}/>;
  });

  return <div style={{ display: 'flex' }}>{list}</div>;
}

export function toPhotos(chat: Chatlog): JSX.Element {
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

export function toVideo(chat: Chatlog): JSX.Element {
  const list = chat.AttachmentList.map((attachment: any) => {
    attachment = attachment as VideoAttachment;

    return <Video
      key={attachment.VideoURL}
      url={attachment.VideoURL}
      width={attachment.Width}
      height={attachment.Height}
      duration={attachment.Duration}/>;
  });

  return <div>{list}</div>;
}

export function toSearch(chat: Chatlog): JSX.Element {
  const list = chat.AttachmentList.map((attachment: any, i) => {
    const { Question, ContentType, ContentList } = attachment;

    return <Search
      key={`search-${chat.logId.toString()}-$i`}
      question={Question}
      type={ContentType}
      list={ContentList}/>;
  });

  return <div>{list}</div>;
}

export function toReply(chat: Chatlog, chatList: Chatlog[]): JSX.Element {
  let prevChat = null;
  const attachments = (chat as ReplyChatObject).AttachmentList as ReplyAttachment[];
  const prevId = attachments[0].SourceLogId;

  for (let i = chatList.indexOf(chat); i >= 0; i--) {
    if (chatList[i].logId.equals(prevId)) {
      prevChat = chatList[i];
      break;
    }
  }

  if (prevChat != null) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return <Reply prevChat={prevChat} me={chat} onClick={() => {
    }}/>;
  } else {
    return <span>{chat.text}</span>;
  }
}

export function toMap(chat: Chatlog): JSX.Element {
  const list = chat.AttachmentList.map((attachment: any) => {
    const { Name, Lat, Lng, A } = attachment;

    return <Location
      key={A}
      name={Name}
      url={''}
      latitude={Lat}
      longitude={Lng}/>;
  });

  return <div>{list}</div>;
}

export function toEmoticon(chat: Chatlog): JSX.Element {
  return <Emoticon chat={chat}/>;
}

export function toDeletedText(chat: Chatlog, chatList: Chatlog[], channel: TalkChannel): JSX.Element {
  return <Deleted chat={chat} chatList={chatList} channel={channel}/>;
}

export function convertChat(
    chat: Chatlog,
    chatList: Chatlog[],
    channel: TalkChannel,
    passUnknown = false,
): JSX.Element | undefined {
  switch (chat.type) {
    case KnownChatType.FEED:
      return convertFeed(chat, chatList, channel);
    case KnownChatType.TEXT:
      if ((chat.text?.length ?? 0) > 500) return toLongText(chat);
      else return toText(chat);
    case KnownChatType.PHOTO:
      return toPhoto(chat);
    case KnownChatType.MULTIPHOTO:
      return toPhotos(chat);
    case KnownChatType.VIDEO:
      return toVideo(chat);
    case KnownChatType.SEARCH:
      return toSearch(chat);
    case KnownChatType.REPLY:
      return toReply(chat, chatList);
    case KnownChatType.STICKER:
    case KnownChatType.STICKERANI:
    case KnownChatType.STICKERGIF:
      return toEmoticon(chat);
    case KnownChatType.FILE:
      console.log('file', chat);
      break;
    case KnownChatType.MAP:
      break;
    default:
      return <div>
        <h5>{chat.type}</h5>
        <span>{chat.text}</span>
      </div>;
  }
}

export function convertShortChat(chat: Chatlog, { size } = { size: 50 }): JSX.Element {
  switch (chat.type) {
    case KnownChatType.FEED:
    case KnownChatType.TEXT:
    case KnownChatType.REPLY:
      return <ShortContent>{
        `${
          chat.text?.substring(0, 25)
        }${
          (chat.text?.length ?? 0) >= 25 ? '...' : ''
        }`
      }</ShortContent>;
    case KnownChatType.PHOTO:
    case KnownChatType.MULTIPHOTO:
      return toPhoto(chat, {
        ratio: 1,
        limit: [size, size],
      });
    case KnownChatType.VIDEO:
      return <ShortContent>동영상</ShortContent>;
    case KnownChatType.SEARCH:
      return <ShortContent>{`샵검색: ${chat.text}`}</ShortContent>;
    case KnownChatType.MAP:
    default:
      return <div>
        <h5>{chat.type}</h5>
        <span>{chat.text}</span>
      </div>;
  }
}

export function convertText(chat: Chatlog): JSX.Element {
  if (isUrl(chat.text ?? '')) {
    return <Link chat={chat}/>;
  }

  return <>{chat.text}</>;
}

export default convertChat;
