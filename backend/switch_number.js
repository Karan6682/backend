const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
require('dotenv').config();

async function connectNewNumber() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log("Admin not found!");
            return;
        }

        const accessToken = admin.whatsappProvider?.accessToken || admin.metaCredentials?.accessToken;
        const targetNumber = "918053284078";
        const wabaId = "1804775563567759"; // From your last screenshot

        console.log(`Searching for Phone Number ID for: ${targetNumber} in WABA: ${wabaId}`);

        const response = await axios.get(
            `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const numbers = response.data.data;
        const target = numbers.find(n => n.display_phone_number.replace(/\D/g, '').includes("8053284078"));

        if (!target) {
            console.log("❌ Number not found in this WABA! Available numbers are:");
            console.log(numbers.map(n => n.display_phone_number));
            process.exit(1);
        }

        console.log(`✅ Found ID: ${target.id}`);

        // Update DB
        admin.whatsappProvider = {
            accessToken: accessToken,
            phoneNumberId: target.id,
            wabaId: wabaId,
            phoneNumber: targetNumber,
            isVerified: target.status === 'CONNECTED' || target.status === 'PENDING' // Letting them try if pending
        };

        // Also update metaCredentials for backward compatibility if needed
        admin.metaCredentials = {
            accessToken: accessToken,
            phoneNumberId: target.id,
            wabaId: wabaId,
            phoneNumber: targetNumber,
            isVerified: true
        };

        await admin.save();
        console.log(`\n🚀 SUCCESS! Your CRM is now switched to: ${target.display_phone_number}`);
        console.log(`Status on Meta: ${target.status}`);

        if (target.status === 'PENDING') {
            console.log("\n⚠️ NOTE: Meta is still reviewing your Display Name. Messages might start working in a few minutes.");
        }

        process.exit();
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        process.exit(1);
    }
}

connectNewNumber();
