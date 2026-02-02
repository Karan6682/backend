const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
require('dotenv').config();

async function inspectSpecificTemplate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        const { accessToken, wabaId } = user.metaCredentials;
        const targetTemplate = 'notification_check_v1';

        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${wabaId}/message_templates`,
            {
                params: { name: targetTemplate },
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        const template = response.data.data.find(t => t.name === targetTemplate);
        if (template) {
            console.log(JSON.stringify(template, null, 2));
        } else {
            console.log(`Template '${targetTemplate}' not found.`);
            // List all approved template names to help debug
            console.log("Available Approved Templates:");
            response.data.data.filter(t => t.status === 'APPROVED').forEach(t => console.log(`- ${t.name} (${t.language})`));
        }
        process.exit();
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

inspectSpecificTemplate();
