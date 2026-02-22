ALTER TABLE channels ADD COLUMN system_token TEXT;
ALTER TABLE channels ADD COLUMN system_userid TEXT;
ALTER TABLE channels ADD COLUMN checkin_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE channels ADD COLUMN checkin_url TEXT;
ALTER TABLE channels ADD COLUMN last_checkin_date TEXT;
ALTER TABLE channels ADD COLUMN last_checkin_status TEXT;
ALTER TABLE channels ADD COLUMN last_checkin_message TEXT;
ALTER TABLE channels ADD COLUMN last_checkin_at TEXT;

CREATE TABLE IF NOT EXISTS channel_call_tokens (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS channel_call_tokens_channel_id ON channel_call_tokens(channel_id);
