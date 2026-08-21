CREATE TABLE IF NOT EXISTS monitoring_events (
  id TEXT PRIMARY KEY,
  route TEXT NOT NULL CHECK (route IN ('analyze', 'events', 'pilot')),
  outcome TEXT NOT NULL CHECK (outcome IN (
    'success',
    'validation_error',
    'rate_limited',
    'upstream_error',
    'schema_validation_failed',
    'timeout',
    'storage_error',
    'bot_accepted'
  )),
  status_code INTEGER NOT NULL CHECK (status_code BETWEEN 100 AND 599),
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  source TEXT NOT NULL DEFAULT 'none' CHECK (source IN ('none', 'openai', 'demo')),
  request_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_monitoring_created
  ON monitoring_events (created_at);

CREATE INDEX IF NOT EXISTS idx_monitoring_route_created
  ON monitoring_events (route, created_at);
