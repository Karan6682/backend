const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function forceConnect() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log("Admin not found!");
            return;
        }

        // Setting your REAL number and the Token you just sent
        admin.whatsappProvider = {
            accessToken: "EAAVqLaG7pX4BQkHQGfZCZCAUMOTCLcONL7LeZCnomRmYuQrRx3XyvGxnNaxs1AkwJ1PwN1H2NJ3TXGfc6xbqUWGgLJmKfHu2DFbKtTGFDBDMDZAD6sIpZBo9PrjiyTCepZCgnP9zya93ZCAeiQT5S48FvvBz0ZB594PDstyWW3pIDIptRBk7smvtkptI2I9nq7BVZCoROz3msLm8tCDiihx9t3Vu43Yc4rOOy7tuZCOG9UNtfkFkyu8rNdZA8r64mdeSUBB31J8QRbEmfuEJoa0qzTsYQZDZD",
            phoneNumberId: "996399890219119",
            wabaId: "157876370731618",
            phoneNumber: "8816016682",
            isVerified: true
        };

        await admin.save();
        console.log("✅ SUCCESS! Your New SIM (8816016682) is now CONNECTED to the CRM.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

forceConnect();
