// Main module file

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || 'http://clickhouse:8123';
const CLICKHOUSE_USERNAME = process.env.CLICKHOUSE_USERNAME || 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD || '';
const PORT = process.env.PORT || 8080;

const express = require('express');
const app = express();
const path = require('path');

const { createClient } = require('@clickhouse/client');

const client = createClient({
    url: CLICKHOUSE_URL,
    username: CLICKHOUSE_USERNAME,
    password: CLICKHOUSE_PASSWORD,
  })


// Middleware to log route visits
app.use(async (req, res, next) => {
    if (req.path !== '/health' && req.path !== '/dashboard') { // Skip logging for health checks
        try {
            await client.insert({
                table: 'route_events',
                values: [
                    {
                        route: req.path,
                        user_agent: req.headers['user-agent'],
                    },
                ],
                format: 'JSONEachRow',
            });
        } catch (err) {
            console.error('Error logging event to ClickHouse:', err);
        }
    }
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add an about page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/health', (req, res) => {
    res.send('OK');
});

app.get('/dashboard', async (req, res) => {
    try {
        const rows = await client.query({
            query: 'SELECT * FROM route_events',
            format: 'JSONEachRow',
          })

        const json = await rows.json();
        console.log('Result: ', json);
        res.json(json);
    } catch (err) {
        console.error('Error querying ClickHouse:', err);
        res.status(500).send('Error fetching analytics data');
    }
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});
