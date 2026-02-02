const mongoose = require('mongoose');
const Campaign = require('./models/campaign.model');
const User = require('./models/user.model');
require('dotenv').config();

async function checkCampaignStats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        if (!user) {
            console.log("User not found.");
            process.exit();
        }

        const campaigns = await Campaign.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);

        if (campaigns.length === 0) {
            console.log("No campaigns found for this user.");
            process.exit();
        }

        console.log(`Campaign Stats for ${user.name}:`);
        console.log('--------------------------------------------------------------------------------');
        console.log('Name\t\t| Sent\t| Delivered\t| Read\t| Failed\t| Date');
        console.log('--------------------------------------------------------------------------------');

        campaigns.forEach(c => {
            const date = new Date(c.createdAt).toLocaleString();
            console.log(`${c.name.padEnd(16)}| ${c.sentCount}\t| ${c.deliveredCount}\t\t| ${c.readCount}\t| ${c.failedCount}\t\t| ${date}`);
        });

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkCampaignStats();
