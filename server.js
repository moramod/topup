const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('.'));

const API_KEY = process.env.TELERIVET_API_KEY;
const PROJECT_ID = process.env.TELERIVET_PROJECT_ID;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Gateway Status စစ်သည့် API
app.get('/api/status', async (req, res) => {
    if (!API_KEY || !PROJECT_ID) return res.json({ online: false });
    try {
        const response = await axios.get(`https://api.telerivet.com/v1/projects/${PROJECT_ID}/routes`, {
            auth: { username: API_KEY, password: '' }
        });
        const isOnline = response.data.data.some(route => route.status === 'active');
        res.json({ online: isOnline });
    } catch (error) {
        res.json({ online: false });
    }
});

// USSD ပို့သည့် API
app.post('/api/recharge', async (req, res) => {
    const { phone, ussd } = req.body;
    try {
        await axios.post(`https://api.telerivet.com/v1/projects/${PROJECT_ID}/messages/send`, {
            content: ussd,
            to_number: phone,
            message_type: 'ussd'
        }, {
            auth: { username: API_KEY, password: '' }
        });
        res.json({ success: true, message: "Request sent!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gateway Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running...'));
