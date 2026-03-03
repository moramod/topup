const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('.'));

// Render Environment Variables မှ Data များကို ယူခြင်း
const API_KEY = process.env.TELERIVET_API_KEY;
const PROJECT_ID = process.env.TELERIVET_PROJECT_ID;

// Home Page ကို ပို့ပေးခြင်း
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ၁။ Telerivet Gateway Status ကို စစ်ဆေးသည့် API
// Website ရှိ Telerivet ✅ Status ပြရန်အတွက် ဖြစ်သည်
app.get('/api/status', async (req, res) => {
    if (!API_KEY || !PROJECT_ID) return res.json({ online: false });

    try {
        const response = await axios.get(
            `https://api.telerivet.com/v1/projects/${PROJECT_ID}/routes`,
            {
                auth: { username: API_KEY, password: '' }
            }
        );
        // ဖုန်းထဲက Telerivet App သည် Active (Online) ဖြစ်နေသလား စစ်သည်
        const isOnline = response.data.data.some(route => route.status === 'active');
        res.json({ online: isOnline });
    } catch (error) {
        console.error('Status Check Error:', error.message);
        res.json({ online: false });
    }
});

// ၂။ ဘေဖြည့်ခြင်း နှင့် USSD ပို့ခြင်း API
app.post('/api/recharge', async (req, res) => {
    const { phone, ussd } = req.body;

    if (!API_KEY || !PROJECT_ID) {
        return res.status(500).json({ success: false, message: "Server Configuration Missing!" });
    }

    try {
        // Telerivet API သို့ USSD ပို့ရန် လှမ်းခေါ်ခြင်း
        await axios.post(
            `https://api.telerivet.com/v1/projects/${PROJECT_ID}/messages/send`,
            {
                content: ussd, // Frontend မှ ပို့လိုက်သော *123*...# သို့မဟုတ် *124#
                to_number: phone,
                message_type: 'ussd'
            },
            {
                auth: { username: API_KEY, password: '' }
            }
        );

        res.json({ success: true, message: "Request sent successfully to gateway." });
    } catch (error) {
        console.error('Telerivet API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: "Gateway ချိတ်ဆက်မှု အဆင်မပြေပါ။" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Project ID: ${PROJECT_ID ? 'Loaded' : 'Missing'}`);
});
