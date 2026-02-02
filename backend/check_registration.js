const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function checkRegistration() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        const token = user.metaCredentials.accessToken;
        const phoneId = user.metaCredentials.phoneNumberId;

        console.log(`Checking registration for Phone ID: ${phoneId}...`);
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${phoneId}`,
            {
                params: { fields: 'registration_status,code_verification_status' },
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log("Registration Status:", JSON.stringify(response.data, null, 2));
        process.exit();
    } catch (err) {
        console.error("Error:");
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

checkRegistration();
