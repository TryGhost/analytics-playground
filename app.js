// Main module file

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || 'http://clickhouse:8123';
const CLICKHOUSE_USERNAME = process.env.CLICKHOUSE_USERNAME || 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD || '';
const PORT = process.env.PORT || 8080;

import express from 'express';
const app = express();
import path from 'path';
import { fileURLToPath } from 'url';

import { createClient } from '@clickhouse/client';
import { migration } from 'clickhouse-migrations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const client = createClient({
    url: CLICKHOUSE_URL,
    username: CLICKHOUSE_USERNAME,
    password: CLICKHOUSE_PASSWORD,
})

// Migrate the database first
await migration('migrations', CLICKHOUSE_URL, CLICKHOUSE_USERNAME, CLICKHOUSE_PASSWORD, 'default');


// Backend routes, these are not logged to ClickHouse
app.get('/health', (req, res) => {
    res.send('OK');
});

app.get('/api/all', async (req, res) => {
    try {
        const rows = await client.query({
            query: 'SELECT * FROM route_events',
            format: 'JSONEachRow',
          })

        const json = await rows.json();
        res.json(json);
    } catch (err) {
        console.error('Error querying ClickHouse:', err);
        res.status(500).send('Error fetching analytics data');
    }
});

app.get('/api/top-pages', async (req, res) => {
    const rows = await client.query({
        query: `SELECT url, COUNT(*) AS hits
        FROM route_events
        GROUP BY url
        ORDER BY hits
        DESC LIMIT 10`,
        format: 'JSONEachRow',
    });

    const json = await rows.json();
    res.json(json);
});


app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});


// Everything after this is logged to ClickHouse

// Middleware to log route visits
app.use(async (req, res, next) => {
    if (req.path !== '/health' && req.path !== '/dashboard') { // Skip logging for health checks
        try {
            await client.insert({
                table: 'route_events',
                values: [
                    {
                        url: req.path,
                        user_agent: req.headers['user-agent'],
                        referrer: req.headers['referrer'],
                        ip_address: req.ip,
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

// Add a blog page
app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});


app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});
