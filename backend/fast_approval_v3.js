const mongoose = require('mongoose');
const User = require('./models/user.model');
const waService = require('./services/whatsapp.service');
require('dotenv').config();

async function createFastApprovalTemplate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        const { accessToken, wabaId } = user.metaCredentials;

        // 3. Simple Transactional Template
        const templateData = {
            name: "notification_check_v1",
            language: "en_US",
            category: "UTILITY",
            components: [
                {
                    type: "BODY",
                    text: "You have a new important notification in your client area. Please login to review it."
                }
            ]
        };

        console.log("Creating UTILITY notification template...");
        const response = await waService.createTemplate(wabaId, accessToken, templateData);
        console.log("Response:", response);

        process.exit();
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

createFastApprovalTemplate();
