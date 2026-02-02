const mongoose = require('mongoose');
const User = require('./models/user.model');
const waService = require('./services/whatsapp.service');
require('dotenv').config();

async function testSendManual() {
    const targetNumber = '918683916682';
    const templateName = 'notification_check_v1';

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        console.log(`Using credentials for: ${user.name}`);
        console.log(`Recipient: ${targetNumber}`);
        console.log(`Template: ${templateName}`);

        const result = await waService.sendTemplateMessage(
            user.metaCredentials.phoneNumberId,
            user.metaCredentials.accessToken,
            targetNumber,
            templateName,
            [] // Empty components
        );

        console.log("Meta API Response:", JSON.stringify(result, null, 2));

        process.exit();
    } catch (err) {
        console.error("Error Sending Message:", err);
        process.exit(1);
    }
}

testSendManual();
