const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
require('dotenv').config();

async function checkAccountHealth() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        if (!user || !user.metaCredentials || !user.metaCredentials.accessToken) {
            console.error("User KARAN or Meta credentials not found");
            process.exit(1);
        }

        const { accessToken, wabaId, phoneNumberId } = user.metaCredentials;
        const API_VERSION = "v19.0";

        console.log(`Checking Health for WABA: ${wabaId}, Phone ID: ${phoneNumberId}`);

        // 1. Check WABA Status
        const wabaRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${wabaId}`, {
            params: {
                fields: 'id,name,status,account_review_status,message_template_namespace',
                access_token: accessToken
            }
        });
        console.log("\n--- WABA STATUS ---");
        console.log(JSON.stringify(wabaRes.data, null, 2));

        // 2. Check Phone Number Status
        const phoneRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}`, {
            params: {
                fields: 'verified_name,code_verification_status,quality_rating,name_status,status,messaging_limit_tier',
                access_token: accessToken
            }
        });
        console.log("\n--- PHONE NUMBER STATUS ---");
        console.log(JSON.stringify(phoneRes.data, null, 2));

        // 3. Check Account Violations (if possible)
        try {
            const violationsRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${wabaId}/whatsapp_violations`, {
                params: { access_token: accessToken }
            });
            console.log("\n--- VIOLATIONS ---");
            console.log(JSON.stringify(violationsRes.data, null, 2));
        } catch (e) {
            console.log("\n--- VIOLATIONS CHECK FAILED (Might not have permission) ---");
        }

        process.exit();
    } catch (err) {
        console.error("Error checking account health:", err.response?.data || err.message);
        process.exit(1);
    }
}

checkAccountHealth();
