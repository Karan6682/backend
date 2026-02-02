const mongoose = require('mongoose');
const User = require('./models/user.model');
const axios = require('axios');
require('dotenv').config();

async function testSendSpecial() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        const { accessToken, phoneNumberId } = user.metaCredentials;
        const to = "918683916682";

        console.log(`Using Phone Number ID: ${phoneNumberId}`);
        console.log(`Sending hello_world template to ${to}...`);

        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "template",
                template: {
                    name: "hello_world",
                    language: { code: "en_US" }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Success! Response:", JSON.stringify(response.data, null, 2));
        process.exit();
    } catch (err) {
        console.error("Send Failed:");
        if (err.response) {
            console.error(JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
        process.exit(1);
    }
}

testSendSpecial();
