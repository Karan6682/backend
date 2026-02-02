const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
const waService = require('./services/whatsapp.service');
require('dotenv').config();

async function createUtilityTemplate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        const { accessToken, wabaId } = user.metaCredentials;

        const templateData = {
            name: "test_utility_v1",
            language: "en_US",
            category: "UTILITY",
            components: [
                {
                    type: "BODY",
                    text: "Hello! Your verification code is {{1}}. Please use it to log in.",
                    example: {
                        body_text: [["123456"]]
                    }
                },
                {
                    type: "FOOTER",
                    text: "Cloud CRM"
                }
            ]
        };

        console.log("Creating UTILITY template...");
        const response = await waService.createTemplate(wabaId, accessToken, templateData);
        console.log("Response:", response);

        process.exit();
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

createUtilityTemplate();
