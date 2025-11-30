// backend.js - single-file Node.js + Express DeepSeek proxy (CommonJS)
// Usage:
// npm init -y
// npm install express cors
// DEEPSEEK_KEY=sk_xxx node backend.js

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // enable CORS for development; restrict in production

const API_KEY = 'sk-63a2625aed';

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message || '';
        if (!userMessage) return res.status(400).json({ error: 'No message provided' });

        const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: userMessage }]
            })
        });

        const data = await r.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(502).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ChatDPT proxy running on http://localhost:${PORT}`));
