const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function finalConnect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log("Admin not found!");
            return;
        }

        const accessToken = "EAAVqLaG7pX4BQi7yP5Myt4MUuBX7kY5dhjxtdVsPmNNBgclUep2AXrXWlQrf9iDxkZB5DhhBtGZCJ15wBJ0TSMxWg7rKYEyiiRDpZCG4i0BkUr6td23qwfK2PZCZClEz7CAJA2mDvfS2j6V6cOu9mqMdYL86nqfymJqt0uiHZCdf3zdP6NVSasZA8W3WOOLeAZDZD";
        const phoneNumberId = "923009500898609";
        const wabaId = "1804775563567759";
        const phoneNumber = "8053284078";

        // Update BOTH possible credential locations in the user model
        const metaData = {
            accessToken,
            phoneNumberId,
            wabaId,
            phoneNumber,
            isVerified: true
        };

        admin.whatsappProvider = metaData;
        admin.metaCredentials = metaData;

        await admin.save();

        console.log("\n=================================================");
        console.log("✅ SUCCESS! CRM CONNECTED TO NEW NUMBER");
        console.log(`Number: +91 ${phoneNumber}`);
        console.log(`Phone ID: ${phoneNumberId}`);
        console.log("=================================================");
        process.exit();
    } catch (err) {
        console.error("Error updating connection:", err.message);
        process.exit(1);
    }
}

finalConnect();
