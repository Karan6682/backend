const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
require('dotenv').config();

async function checkPhoneNumbers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        const { accessToken, wabaId } = user.metaCredentials;
        console.log(`Checking numbers for WABA: ${wabaId}...`);

        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log("Phone Numbers:", JSON.stringify(response.data, null, 2));
        process.exit();
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

checkPhoneNumbers();
