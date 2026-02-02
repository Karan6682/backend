require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

const newToken = 'EAAVqLaG7pX4BQvUFKtozs5Lio89akM7bGY8D1UN0FukO08TL4d2FZCve55HeeURaDcaeJfBcOI3ZA9QRr9rabnPZBaOYiJg0waIyh6HwsZAz7aAf19YIUAaBkwLaONmuBjAQe4qSFAmDbrlJBnB5Bf9RYHZACtcOITVgWpClcmEx9X9s0PIXrxWuGPYsyAAZDZD';
const wabaId = '1804775563567759';
const appId = '1524119103055230';

async function update() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateMany(
            { 'metaCredentials.wabaId': wabaId },
            {
                $set: {
                    'metaCredentials.accessToken': newToken,
                    'metaCredentials.appId': appId
                }
            }
        );
        console.log(`Successfully updated ${result.modifiedCount} users.`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

update();
