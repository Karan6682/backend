const mongoose = require('mongoose');
const User = require('./models/user.model');
const waService = require('./services/whatsapp.service');
require('dotenv').config();

async function createFastApprovalTemplate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        const { accessToken, wabaId } = user.metaCredentials;

        // 1. UTILITY Template (Usually faster)
        // No variables = Higher chance of instant AI approval
        const templateData = {
            name: "service_update_v10",
            language: "en_US",
            category: "UTILITY",
            components: [
                {
                    type: "BODY",
                    text: "Important update regarding your service request. Please visit our website for more details."
                }
            ]
        };

        console.log("Creating Fast Approval UTILITY template...");
        const response = await waService.createTemplate(wabaId, accessToken, templateData);
        console.log("Response:", response);

        process.exit();
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

createFastApprovalTemplate();
