const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function checkToken() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        const token = user.metaCredentials.accessToken;

        console.log("Checking token validity via /me endpoint...");
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/me`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Token is VALID. Linked to:", response.data);
        process.exit();
    } catch (err) {
        console.error("Token is INVALID:");
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

checkToken();
