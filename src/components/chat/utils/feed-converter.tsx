import React from 'react';

import {Chat, FeedMemberStruct, FeedType} from 'node-kakao';

import Invite from '../types/invite';
import Leave from '../types/leave';

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

export function convertFeed(
    chat: Chat,
    chatList: Chat[],
    options = {
      feed: null,
    },
): JSX.Element | undefined {
  const feed = options.feed == null ? chat.getFeed() : options.feed;

  switch (feed?.feedType) {
    case FeedType.DELETE_TO_ALL:
      return undefined;
    case FeedType.INVITE: case FeedType.OPENLINK_JOIN:
      return toInvite(feed, chat);
    case FeedType.LEAVE: case FeedType.LOCAL_LEAVE: case FeedType.SECRET_LEAVE:
      return toLeave(feed, chat);
    default:
      return <span>{chat.Text}</span>;
  }
}

export default convertFeed;
