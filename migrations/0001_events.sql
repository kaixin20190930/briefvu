CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_session_created
  ON analytics_events (session_id, created_at);

CREATE TABLE IF NOT EXISTS pilot_leads (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  shop_name TEXT,
  status TEXT NOT NULL DEFAULT 'interested',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
