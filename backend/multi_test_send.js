const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function multiSend() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        const { accessToken, phoneNumberId } = user.metaCredentials;
        const to = "918683916682";

        const templates = ["hello_world", "welcome_msg", "simple_hello_v1", "welcome_pathostar_v1"];

        for (const t of templates) {
            console.log(`Sending ${t} to ${to}...`);
            try {
                const response = await axios.post(
                    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
                    {
                        messaging_product: "whatsapp",
                        recipient_type: "individual",
                        to: to,
                        type: "template",
                        template: {
                            name: t,
                            language: { code: "en_US" }
                        }
                    },
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                console.log(`  Success! ID: ${response.data.messages[0].id}`);
            } catch (err) {
                console.error(`  Failed for ${t}:`, err.response?.data || err.message);
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        process.exit();
    } catch (err) {
        console.error("Critical Error:", err.message);
        process.exit(1);
    }
}

multiSend();
