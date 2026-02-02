require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find({ 'metaCredentials.wabaId': '1804775563567759' });
        console.log('Users found with WABA ID 1804775563567759:', users.length);

        users.forEach(u => {
            console.log(`User: ${u.name} (${u.email})`);
            console.log(`Creds:`, JSON.stringify(u.metaCredentials, null, 2));
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

check();
