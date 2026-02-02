const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function testText() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        const { accessToken, phoneNumberId } = user.metaCredentials;
        const to = "918683916682";

        console.log(`Sending text message to ${to}...`);
        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: { body: "Hello! This is a test message from your Cloud CRM." }
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log("Success! Response:", response.data);
        process.exit();
    } catch (err) {
        console.error("Failed:", err.response?.data || err.message);
        process.exit(1);
    }
}

testText();
