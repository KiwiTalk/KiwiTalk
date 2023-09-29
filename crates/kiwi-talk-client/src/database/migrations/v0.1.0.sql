-- See /src/database/chat.rs
CREATE TABLE IF NOT EXISTS chat (
    log_id INTEGER PRIMARY KEY NOT NULL,
    channel_id INTEGER NOT NULL,
    prev_log_id INTEGER,
    type INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    send_at INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    message TEXT,
    attachment TEXT,
    supplement TEXT,
    referer INTEGER,

    deleted_time INTEGER
);

CREATE TABLE IF NOT EXISTS channel_update (
    id INTEGER NOT NULL,
    type VARCHAR(16) NOT NULL,

    last_seen_log_id INTEGER NOT NULL,
    last_update INTEGER NOT NULL,

    PRIMARY KEY(id, type)
);

CREATE TABLE IF NOT EXISTS channel_meta (
    channel_id INTEGER NOT NULL,
    type INTEGER NOT NULL,

    author_id INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    revision INTEGER NOT NULL,
    content TEXT NOT NULL,

    PRIMARY KEY(channel_id, type)
);

CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER NOT NULL,
    channel_id INTEGER NOT NULL,

    nickname VARCHAR NOT NULL,

    profile_url TEXT,
    full_profile_url TEXT,
    original_profile_url TEXT,
    
    watermark INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY(id, channel_id)
);

CREATE TABLE IF NOT EXISTS normal_channel (
    id INTEGER PRIMARY KEY NOT NULL,

    joined_at_for_new_mem INTEGER,
    inviter_user_id INTEGER
);

CREATE TABLE IF NOT EXISTS normal_channel_user (
    id INTEGER NOT NULL,
    channel_id INTEGER NOT NULL,

    country_iso VARCHAR(4) NOT NULL,
    account_id INTEGER NOT NULL,
    status_message TEXT,
    linked_services TEXT,
    suspended BOOLEAN NOT NULL,

    PRIMARY KEY(id, channel_id)
);
