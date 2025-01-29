-- Add columns to support web analytics data
ALTER TABLE route_events
ADD COLUMN IF NOT EXISTS referrer String DEFAULT '',
ADD COLUMN IF NOT EXISTS ip_address String DEFAULT '',
ADD COLUMN IF NOT EXISTS url String DEFAULT '';

-- Copy data from `route` to `url`
ALTER TABLE route_events
UPDATE url = route WHERE route != '';
