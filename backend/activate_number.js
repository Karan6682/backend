const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
require('dotenv').config();

async function registerKaranNumber() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        if (!user) {
            console.log("Karan not found!");
            return;
        }

        const { accessToken, phoneNumberId } = user.metaCredentials;
        console.log(`Registering Number ID: ${phoneNumberId}...`);

        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${phoneNumberId}/register`,
            { messaging_product: 'whatsapp', pin: '000000' },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log("✅ ACTIVATION SUCCESSFUL!", response.data);

        user.metaCredentials.isVerified = true;
        await user.save();

        process.exit();
    } catch (err) {
        console.error("❌ ACTIVATION FAILED!");
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

registerKaranNumber();
