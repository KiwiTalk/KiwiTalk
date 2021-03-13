import {
  Chat,
  ChatChannel,
  ChatType,
  FeedType,
  PhotoAttachment,
  ReplyAttachment,
  ReplyChat as ReplyChatObject,
  VideoAttachment,
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

export function toText(chat: Chat): JSX.Element {
  return <Content>{convertText(chat)}</Content>;
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
      key={attachment.ImageURL}
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
      key={attachment.VideoURL}
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
  const attachments = (chat as ReplyChatObject).AttachmentList as ReplyAttachment[];
  const prevId = attachments[0].SourceLogId;

  for (let i = chatList.indexOf(chat); i >= 0; i--) {
    if (chatList[i].LogId.equals(prevId)) {
      prevChat = chatList[i];
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

export function toEmoticon(chat: Chat): JSX.Element {
  return <Emoticon chat={chat}/>;
}

export function toDeletedText(chat: Chat, chatList: Chat[], channel: ChatChannel): JSX.Element {
  return <Deleted chat={chat} chatList={chatList} channel={channel}/>;
}

export function convertChat(
    chat: Chat,
    chatList: Chat[],
    channel: ChatChannel,
    passUnknown = false,
): JSX.Element | undefined {
  switch (chat.Type) {
    case ChatType.Feed:
      return convertFeed(chat, chatList, channel);
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
      console.log(chat);
      if (passUnknown) return <span>{chat.Text}</span>;

      try {
        const content = JSON.parse(chat.Text);

        if (content.feedType !== FeedType.UNDEFINED) {
          return convertFeed(chat, chatList, channel, { feed: content });
        }
      } catch (err) {
        return toDeletedText(chat, chatList, channel);
      }

      return <span>{chat.Text}</span>;
    case ChatType.Sticker:
    case ChatType.StickerAni:
    case ChatType.StickerGif:
      return toEmoticon(chat);
    case ChatType.File:
      console.log('file', chat);
      break;
    case ChatType.Map:
      break;
    default:
      return <div>
        <h5>{chat.Type}</h5>
        <span>{chat.Text}</span>
      </div>;
  }
}

export function convertShortChat(chat: Chat, { size } = { size: 50 }): JSX.Element {
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
        limit: [size, size],
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

export function convertText(chat: Chat): JSX.Element {
  if (isUrl(chat.Text)) {
    return <Link chat={chat}/>;
  }

  return <>{chat.Text}</>;
}

export default convertChat;
