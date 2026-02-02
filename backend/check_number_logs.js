const mongoose = require('mongoose');
const Campaign = require('./models/campaign.model');
require('dotenv').config();

async function checkSpecificLogs() {
    const targetNumber = '918683916682';
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Find campaigns that have logs for this number
        const campaigns = await Campaign.find({
            "logs.number": targetNumber
        }).sort({ createdAt: -1 }).limit(5);

        if (campaigns.length === 0) {
            console.log(`No logs found for number: ${targetNumber}`);
            process.exit();
        }

        console.log(`Found ${campaigns.length} campaigns with logs for ${targetNumber}:\n`);

        campaigns.forEach(campaign => {
            const logEntry = campaign.logs.find(log => log.number === targetNumber);
            console.log(`--- Campaign: ${campaign.name} ---`);
            console.log(`Date: ${campaign.createdAt}`);
            console.log(`Status: ${logEntry.status}`);
            if (logEntry.error) {
                console.log(`Error: ${logEntry.error}`);
            }
            if (logEntry.messageId) {
                console.log(`Message ID: ${logEntry.messageId}`);
            }
            console.log('-----------------------------------\n');
        });

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkSpecificLogs();
