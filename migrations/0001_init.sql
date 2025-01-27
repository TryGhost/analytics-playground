CREATE TABLE IF NOT EXISTS route_events (
    id UUID DEFAULT generateUUIDv4(),
    timestamp DateTime DEFAULT now(),
    route String,
    user_agent String
)
ENGINE = MergeTree()
ORDER BY timestamp;
