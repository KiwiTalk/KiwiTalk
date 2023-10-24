pub const INIT_SQL: &str = "
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA wal_autocheckpoint = 8192;
PRAGMA wal_checkpoint(TRUNCATE);
";