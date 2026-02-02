const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/user.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testApiSend() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });

        // Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');

        console.log("Calling /api/whatsapp/send-template...");
        const response = await axios.post(
            'http://localhost:5000/api/whatsapp/send-template',
            {
                to: "918683916682",
                templateName: "welcome_msg",
                components: []
            },
            { headers: { 'x-auth-token': token } }
        );

        console.log("API Response:", JSON.stringify(response.data, null, 2));
        process.exit();
    } catch (err) {
        console.error("API Call Failed:");
        console.error(err.response?.data || err.message);
        process.exit(1);
    }
}

testApiSend();
