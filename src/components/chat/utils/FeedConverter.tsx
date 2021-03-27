import React from 'react';

import {
  TalkChannel, KnownFeedType, Chatlog, ChatFeeds, ChannelUserInfo, InviteFeed,
} from 'node-kakao';
import DeletedAt from '../types/DeletedAt';

import Invite from '../types/Invite';
import Leave from '../types/Leave';
import KakaoManager from '../../../KakaoManager';

export function toInvite(
    user: ChannelUserInfo,
    feed: InviteFeed,
): JSX.Element {
  if (feed.inviter) {
    return <Invite invitee={
      feed.members.map((e) => e.nickName)
    } inviter={
      feed.inviter.nickName
    }/>;
  } else {
    return <Invite invitee={
      user.nickname
    } inviter={
      null
    }/>;
  }
}

export function toLeave(user: ChannelUserInfo): JSX.Element {
  return <Leave member={user.nickname}/>;
}

export function toDeletedAt(
    feed: ChatFeeds,
    chat: Chatlog,
    chatList: Chatlog[],
    channel: TalkChannel,
): JSX.Element {
  const findChat = chatList.find((c) => c.logId.toString() === chat.logId.toString());

  return <DeletedAt
    sender={channel.getUserInfo(chat.sender)?.nickname}
    chat={findChat}
    chatList={chatList}
    channel={channel}/>;
}

export function convertFeed(
    chat: Chatlog,
    chatList: Chatlog[],
    channel: TalkChannel,
    options = {
      feed: null,
    },
): JSX.Element | undefined {
  const feedPair = KakaoManager.feedList.get(chat);
  const feed = options.feed == null ? feedPair?.first : options.feed;

  switch (feed?.feedType) {
    case KnownFeedType.DELETE_TO_ALL:
      return toDeletedAt(feed, chat, chatList, channel);
    case KnownFeedType.INVITE:
    case KnownFeedType.OPENLINK_JOIN:
      if (feedPair && feedPair.second) {
        return toInvite(feedPair.second, feed as InviteFeed);
      }
      break;
    case KnownFeedType.LEAVE:
    case KnownFeedType.LOCAL_LEAVE:
    case KnownFeedType.SECRET_LEAVE:
      if (feedPair && feedPair.second) {
        return toLeave(feedPair.second);
      }
      break;
    default:
      return <span>{chat.text}</span>;
  }
}

export default convertFeed;
