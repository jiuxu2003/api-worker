CREATE TABLE IF NOT EXISTS checkin_sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  checkin_url TEXT,
  token TEXT NOT NULL,
  new_api_user TEXT,
  last_checkin_date TEXT,
  last_checkin_status TEXT,
  last_checkin_message TEXT,
  last_checkin_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
