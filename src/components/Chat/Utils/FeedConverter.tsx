import React from "react";

import { Chat, FeedType, ChatFeed } from "node-kakao";

import Invite from "../Type/Invite";
import Leave from "../Type/Leave";

export function toInvite(feed: any, chat: Chat) {
    if (feed.inviter) {
        return <Invite invitee={feed.members.map((e: any) => e.nickName)} inviter={feed.inviter.nickName}></Invite>
    } else {
        return <Invite invitee={feed.members.map((e: any) => e.nickName)} inviter={null}></Invite>
    }
}

export function toLeave(feed: any, chat: Chat) {
    return <Leave member={feed.member.nickName}></Leave>
}

export function convertFeed (chat: Chat, chatList: Chat[], options = { feed: null }) {
    let feed = options.feed == null ? chat.getFeed() : options.feed;

    switch(feed?.feedType) {
        case FeedType.DELETE_TO_ALL:
            return undefined;
        case FeedType.INVITE: case FeedType.OPENLINK_JOIN:
            return toInvite(feed, chat)
        case FeedType.LEAVE: case FeedType.LOCAL_LEAVE: case FeedType.SECRET_LEAVE:
            return toLeave(feed, chat)
        default:
            return <span>{chat.Text}</span>
    }
}

export default convertFeed;