const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');
require('dotenv').config();

const MONGO_URI = "mongodb://127.0.0.1:27017/whatsapp_saas";

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected for Admin Creation");

        const adminEmail = "admin@cloudcrm.com";
        const adminPass = "admin123";

        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log("Admin user already exists. Updating role/password...");
            // Force update to ensure credentials are known
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(adminPass, salt);
            user.role = 'admin';
            user.paymentInfo = { upiId: '8683916682@ptsbi', receiverName: 'CloudCRM Admin' }; // Store UPI here for now
            await user.save();
        } else {
            console.log("Creating new Admin user...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPass, salt);

            user = new User({
                name: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                company: "CloudCRM HQ",
                paymentInfo: { upiId: '8683916682@ptsbi', receiverName: 'CloudCRM Admin' }
            });
            await user.save();
        }

        console.log(`\n\n================================`);
        console.log(`ADMIN CREDENTIALS CREATED/UPDATED`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPass}`);
        console.log(`UPI ID: 8683916682@ptsbi`);
        console.log(`================================\n\n`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
