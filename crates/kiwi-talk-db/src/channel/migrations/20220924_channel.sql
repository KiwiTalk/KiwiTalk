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
