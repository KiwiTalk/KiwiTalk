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

CREATE TABLE IF NOT EXISTS channel (
    id INTEGER PRIMARY KEY,
    type VARCHAR(16) NOT NULL,
    active_user_count INTEGER,
    new_chat_count INTEGER,
    last_chat_log_id INTEGER,
    last_seen_log_id INTEGER,
    push_alert BOOLEAN
);

CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS normal_channel (
    id INTEGER PRIMARY KEY,
    join_time INTEGER,

    FOREIGN KEY(id) REFERENCES channel(id)
);

CREATE TABLE IF NOT EXISTS normal_user (
    id INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS open_channel (
    id INTEGER PRIMARY KEY,
    link_id INTEGER NOT NULL,
    open_token INTEGER,
    
    link_name VARCHAR(32),
    link_cover_url TEXT,
    description VARCHAR(32),
    searchable BOOLEAN,
    activated BOOLEAN,

    link_url TEXT,
    profile_tag_list TEXT,
    created_at INTEGER,

    owner_link_id INTEGER,

    privilege INTEGER,

    FOREIGN KEY(id) REFERENCES channel(id)
);

CREATE TABLE IF NOT EXISTS open_user (
    id INTEGER PRIMARY KEY
);
