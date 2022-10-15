-- See /src/chat/model.rs
CREATE TABLE IF NOT EXISTS chat (
    log_id INTEGER PRIMARY KEY,
    prev_log_id INTEGER,
    type INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    send_at INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    message TEXT,
    attachment TEXT,
    supplement TEXT,
    referer INTEGER
);

-- See /src/channel/model.rs
CREATE TABLE IF NOT EXISTS channel (
    id INTEGER PRIMARY KEY,
    type VARCHAR(16) NOT NULL,
    active_user_count INTEGER NOT NULL,
    new_chat_count INTEGER NOT NULL,
    last_chat_log_id INTEGER,
    last_seen_log_id INTEGER,
    push_alert BOOLEAN
);

-- See /src/channel/model.rs
CREATE TABLE IF NOT EXISTS channel_user (
    id INTEGER PRIMARY KEY,
    channel_id INTEGER NOT NULL,

    nickname VARCHAR NOT NULL,

    profile_url TEXT,
    full_profile_url TEXT,
    original_profile_url TEXT,
    user_type INTEGER NOT NULL,

    FOREIGN KEY(channel_id) REFERENCES channel(id)
);

-- See /src/channel/normal/model.rs
CREATE TABLE IF NOT EXISTS normal_channel (
    id INTEGER PRIMARY KEY,

    join_time INTEGER,

    FOREIGN KEY(id) REFERENCES channel(id)
);

-- See /src/channel/normal/model.rs
CREATE TABLE IF NOT EXISTS normal_channel_user (
    id INTEGER PRIMARY KEY,
    channel_id INTEGER NOT NULL,

    country_iso VARCHAR(4) NOT NULL,
    account_id INTEGER NOT NULL,
    status_message TEXT,
    linked_services TEXT,
    suspended BOOLEAN,

    FOREIGN KEY(id) REFERENCES user(id),
    FOREIGN KEY(channel_id) REFERENCES channel(id)
);
