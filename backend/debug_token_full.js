const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function debugTokenFull() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        const token = user.metaCredentials.accessToken;

        // Note: To use debug_token, you need an APP ACCESS TOKEN or an ADMIN TOKEN.
        // We will try to see if this token can inspect itself or if we can use a known good App.
        // Since we don't have a good App ID/Secret, we'll try Strategy 4: /me/permissions

        console.log("Checking token permissions...");
        const response = await axios.get(
            `https://graph.facebook.com/v19.0/me/permissions`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Permissions:", JSON.stringify(response.data, null, 2));

        console.log("\nChecking token app details...");
        const appResponse = await axios.get(
            `https://graph.facebook.com/v19.0/app`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("App Details:", JSON.stringify(appResponse.data, null, 2));

        process.exit();
    } catch (err) {
        console.error("Error:");
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

debugTokenFull();
