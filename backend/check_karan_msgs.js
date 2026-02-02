const mongoose = require('mongoose');
const Message = require('./models/message.model');
const User = require('./models/user.model');
require('dotenv').config();

async function checkRecentMessages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ name: /karan/i });
        const messages = await Message.find({ userId: user._id }).sort({ timestamp: -1 }).limit(10);

        if (messages.length === 0) {
            console.log("No individual messages found.");
            process.exit();
        }

        console.log(`Recent Individual Messages for ${user.name}:`);
        messages.forEach(m => {
            console.log(`[${m.direction}] From: ${m.from}, To: ${m.to}, Text: ${m.text || '[Media]'}`);
        });

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkRecentMessages();
