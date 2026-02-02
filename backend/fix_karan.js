const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function fixKaran() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        if (!user) {
            console.log("Karan NOT found!");
            return;
        }

        const accessToken = "EAAVqLaG7pX4BQi7yP5Myt4MUuBX7kY5dhjxtdVsPmNNBgclUep2AXrXWlQrf9iDxkZB5DhhBtGZCJ15wBJ0TSMxWg7rKYEyiiRDpZCG4i0BkUr6td23qwfK2PZCZClEz7CAJA2mDvfS2j6V6cOu9mqMdYL86nqfymJqt0uiHZCdf3zdP6NVSasZA8W3WOOLeAZDZD";
        const phoneNumberId = "923009500898609";
        const wabaId = "1804775563567759";
        const phoneNumber = "8053284078";

        user.metaCredentials = {
            accessToken,
            phoneNumberId,
            wabaId,
            phoneNumber,
            isVerified: true
        };

        await user.save();
        console.log(`✅ Success! KARAN's account UPDATED and VERIFIED with ${phoneNumber}`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixKaran();
