const mongoose = require('mongoose');
const Campaign = require('./models/campaign.model');
require('dotenv').config();

async function checkLogs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const campaign = await Campaign.findOne().sort({ createdAt: -1 });

        if (!campaign) {
            console.log("No campaigns found.");
            process.exit();
        }

        console.log(`Campaign Name: ${campaign.name}`);
        console.log(`Template: ${campaign.templateName}`);
        console.log(`Status: ${campaign.status}`);
        console.log(`Logs:`, JSON.stringify(campaign.logs, null, 2));

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkLogs();
