const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function checkUserDetail() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        if (!user) {
            console.log("User not found.");
            process.exit();
        }

        console.log("User Detail for Karan:");
        console.log(`  Wallet Balance: ${user.wallet.balance}`);
        console.log(`  Per Message Cost: ${user.pricing.perMessageCost}`);
        console.log(`  isVerified: ${user.metaCredentials.isVerified}`);
        console.log(`  Phone Number: ${user.metaCredentials.phoneNumber}`);

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkUserDetail();
