ALTER TABLE pilot_leads ADD COLUMN contact_name TEXT;
ALTER TABLE pilot_leads ADD COLUMN email_normalized TEXT;
ALTER TABLE pilot_leads ADD COLUMN weekly_enquiries TEXT;
ALTER TABLE pilot_leads ADD COLUMN current_workflow TEXT;
ALTER TABLE pilot_leads ADD COLUMN notes TEXT;
ALTER TABLE pilot_leads ADD COLUMN consent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pilot_leads ADD COLUMN updated_at TEXT;

UPDATE pilot_leads
SET email_normalized = lower(trim(email)), updated_at = created_at
WHERE email_normalized IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pilot_leads_email_normalized
  ON pilot_leads (email_normalized);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  client_hash TEXT NOT NULL,
  route TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (client_hash, route, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON api_rate_limits (window_start);
