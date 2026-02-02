const mongoose = require('mongoose');
const Campaign = require('./models/campaign.model');
require('dotenv').config();

async function checkFailedCampaigns() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const campaigns = await Campaign.find({ 'logs.status': 'failed' }).sort({ createdAt: -1 }).limit(5);
        console.log("Failed Campaigns:", JSON.stringify(campaigns, null, 2));
        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkFailedCampaigns();
