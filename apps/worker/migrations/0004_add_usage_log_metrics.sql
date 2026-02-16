ALTER TABLE usage_logs ADD COLUMN first_token_latency_ms INTEGER;
ALTER TABLE usage_logs ADD COLUMN stream INTEGER;
ALTER TABLE usage_logs ADD COLUMN reasoning_effort TEXT;
