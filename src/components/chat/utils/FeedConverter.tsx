import React from 'react';

import { Chat, TalkChannel, FeedType, KnownFeedType } from 'node-kakao';
import DeletedAt from '../types/DeletedAt';

import Invite from '../types/Invite';
import Leave from '../types/Leave';

export function toInvite(feed: any, chat: Chat): JSX.Element {
  if (feed.inviter) {
    return <Invite invitee={
      feed.members.map((e: FeedMemberStruct) => e.nickName)
    } inviter={
      feed.inviter.nickName
    }/>;
  } else {
    return <Invite invitee={
      feed.members.map((e: FeedMemberStruct) => e.nickName)
    } inviter={
      null
    }/>;
  }
}

export function toLeave(feed: any, chat: Chat): JSX.Element {
  return <Leave member={feed.member.nickName}/>;
}

export function toDeletedAt(
    feed: any,
    chat: Chat,
    chatList: Chat[],
    channel: TalkChannel,
): JSX.Element {
  const findChat = chatList.find((c) => c.LogId.toString() === feed.logId.toString());

  return <DeletedAt
    sender={channel.getUserInfo(chat.Sender)?.Nickname}
    chat={findChat}
    chatList={chatList}
    channel={channel}/>;
}

export function convertFeed(
    chat: Chat,
    chatList: Chat[],
    channel: TalkChannel,
    options = {
      feed: null,
    },
): JSX.Element | undefined {
  const feed = options.feed == null ? chat.getFeed() : options.feed;

  switch (feed?.feedType) {
    case KnownFeedType.DELETE_TO_ALL:
      return toDeletedAt(feed, chat, chatList, channel);
    case KnownFeedType.INVITE: case KnownFeedType.OPENLINK_JOIN:
      return toInvite(feed, chat);
    case KnownFeedType.LEAVE: case KnownFeedType.LOCAL_LEAVE: case KnownFeedType.SECRET_LEAVE:
      return toLeave(feed, chat);
    default:
      return <span>{chat.text}</span>;
  }
}

export default convertFeed;
