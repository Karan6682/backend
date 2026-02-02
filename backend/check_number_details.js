const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function checkNumberDetails() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        const token = user.metaCredentials.accessToken;
        const phoneId = user.metaCredentials.phoneNumberId;

        console.log(`Checking number details for Phone ID: ${phoneId}...`);
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${phoneId}`,
            {
                params: { fields: 'id,display_phone_number,verified_name,quality_rating,status,code_verification_status' },
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log("Number Details:", JSON.stringify(response.data, null, 2));
        process.exit();
    } catch (err) {
        console.error("Error:");
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

checkNumberDetails();
