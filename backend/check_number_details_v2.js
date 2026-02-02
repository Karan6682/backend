const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
require('dotenv').config();

async function checkNumberDetails() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        const { accessToken, phoneNumberId } = user.metaCredentials;

        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${phoneNumberId}`,
            {
                params: { fields: 'display_phone_number,verified_name' },
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        console.log("Details for Phone ID:", phoneNumberId);
        console.log(JSON.stringify(response.data, null, 2));

        process.exit();
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

checkNumberDetails();
