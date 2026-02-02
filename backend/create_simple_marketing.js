const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
const waService = require('./services/whatsapp.service');
require('dotenv').config();

async function createSimpleMarketing() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        const { accessToken, wabaId } = user.metaCredentials;

        const templateData = {
            name: "welcome_pathostar_v1",
            language: "en_US",
            category: "MARKETING",
            components: [
                {
                    type: "BODY",
                    text: "Welcome to Pathostar CRM. We are here to help you grow your business."
                },
                {
                    type: "FOOTER",
                    text: "Pathostar Team"
                }
            ]
        };

        console.log("Creating MARKETING template...");
        const response = await waService.createTemplate(wabaId, accessToken, templateData);
        console.log("Response:", response);

        process.exit();
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

createSimpleMarketing();
