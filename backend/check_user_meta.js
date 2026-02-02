const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        if (!user) {
            console.log("User not found.");
            process.exit();
        }

        console.log("User Meta Credentials:");
        console.log(`  Phone Number: ${user.metaCredentials.phoneNumber}`);
        console.log(`  Phone Number ID: ${user.metaCredentials.phoneNumberId}`);
        console.log(`  WABA ID: ${user.metaCredentials.wabaId}`);
        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkUser();
