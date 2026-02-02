const mongoose = require('mongoose');
const User = require('./models/user.model');
const waService = require('./services/whatsapp.service');
require('dotenv').config();

async function createFastApprovalTemplate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        const { accessToken, wabaId } = user.metaCredentials;

        // 2. MARKETING Template (Simple greeting)
        const templateData = {
            name: "simple_hello_v1",
            language: "en_US",
            category: "MARKETING",
            components: [
                {
                    type: "BODY",
                    text: "Hello! Thank you for reaching out to us. We will be with you shortly."
                }
            ]
        };

        console.log("Creating MARKETING greeting template...");
        const response = await waService.createTemplate(wabaId, accessToken, templateData);
        console.log("Response:", response);

        process.exit();
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

createFastApprovalTemplate();
