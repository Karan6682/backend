const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function checkKaran() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        if (user) {
            console.log("Karan found:", user._id, user.name, user.role);
            console.log("Credentials:", JSON.stringify(user.metaCredentials, null, 2));
        } else {
            console.log("Karan NOT found by name.");
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkKaran();
