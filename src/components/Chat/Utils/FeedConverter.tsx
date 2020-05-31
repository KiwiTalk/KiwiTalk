import React from "react";

import { Chat, FeedType } from "node-kakao";

export function convertFeed (chat: Chat, chatList: Chat[]) {
    const feed = chat.getFeed()
    switch(feed.feedType) {
        case FeedType.DELETE_TO_ALL:
            return undefined;
        default:
            return <span>{chat.Text}</span>
    }
}

export default convertFeed;