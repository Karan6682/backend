const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
require('dotenv').config();

async function listTemplates() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        const { accessToken, wabaId } = user.metaCredentials;
        console.log(`Fetching templates for WABA: ${wabaId}...`);

        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${wabaId}/message_templates`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const templates = response.data.data;
        console.log("\n--- AVAILABLE TEMPLATES ---");
        if (templates.length === 0) {
            console.log("No templates found. You need to create one!");
        } else {
            templates.forEach(t => {
                console.log(`- Name: ${t.name} (Status: ${t.status}, Language: ${t.language})`);
            });
        }

        process.exit();
    } catch (err) {
        console.error("Error fetching templates:", err.response?.data || err.message);
        process.exit(1);
    }
}

listTemplates();
