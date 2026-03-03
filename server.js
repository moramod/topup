const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// သင့်ရဲ့ အချက်အလက်များ
const GATEWAY_API = "88e071f173f00168c482c27439214c6e";
const GATEWAY_ID = "12791";

// ဖုန်း App အွန်လိုင်း ရှိ/မရှိ စစ်ဆေးရန်
app.get('/api/status', async (req, res) => {
    try {
        const response = await axios.get(`https://smsgateway24.com/getapi/v1/device/status?token=${GATEWAY_API}&device_id=${GATEWAY_ID}`);
        res.json({ success: response.data.success, status: response.data.device_status });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// USSD (Topup/Balance) ပို့ရန်
app.post('/api/ussd', async (req, res) => {
    const { code, simSlot } = req.body;
    try {
        const response = await axios.post('https://smsgateway24.com/getapi/v1/ussd', {
            token: GATEWAY_API,
            device_id: GATEWAY_ID,
            send_to: code,
            sim: parseInt(simSlot)
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
