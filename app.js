// Main module file
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const path = require('path');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
    res.send('OK');
});

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
