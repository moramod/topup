const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('.'));

// Telerivet Credentials (Code ထဲ တိုက်ရိုက်ထည့်ထားသည်)
const API_KEY = "NCSLv_GJbeggLadOHU1UjuHRKbP3bKzUjMy1"; 
const PROJECT_ID = "PJ19c103b08f4daf38"; 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Gateway Status Check API
app.get('/api/status', async (req, res) => {
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

// USSD Action API
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
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is running...'));
