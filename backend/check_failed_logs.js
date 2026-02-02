const mongoose = require('mongoose');
const Campaign = require('./models/campaign.model');
require('dotenv').config();

async function checkFailedLogs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const campaigns = await Campaign.find({ failedCount: { $gt: 0 } }).sort({ createdAt: -1 }).limit(5);

        if (campaigns.length === 0) {
            console.log("No failed campaigns found.");
            process.exit();
        }

        campaigns.forEach(c => {
            console.log(`Campaign: ${c.name}, Failed: ${c.failedCount}`);
            const failedLogs = c.logs.filter(l => l.status === 'failed');
            failedLogs.forEach(l => {
                console.log(`  Number: ${l.number}, Error: ${l.error}`);
            });
        });

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkFailedLogs();
