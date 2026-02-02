const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const Message = require("../models/message.model");
const waService = require("../services/whatsapp.service");
const aiService = require("../services/ai.service");
const auth = require("../middlewares/auth.middleware");

// Get AI Suggestion
router.post("/ai-suggest", auth, async (req, res) => {
    try {
        const { text, number } = req.body;

        // Fetch context (last 5 messages)
        const context = await Message.find({
            userId: req.user.id,
            from: number
        }).sort({ timestamp: -1 }).limit(5);

        const suggestion = await aiService.getAISuggestion(text, context.reverse());
        res.json({ suggestion });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Webhook is now handled in whatsapp.routes.js to support single callback URL

// Get Chat List (Contacts)
router.get("/contacts", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const contacts = await Message.aggregate([
            { $match: { userId: new require('mongoose').Types.ObjectId(userId) } },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$from",
                    lastMessage: { $first: "$text" },
                    lastTime: { $first: "$timestamp" },
                    unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$direction", "incoming"] }, { $eq: ["$isRead", false] }] }, 1, 0] } }
                }
            },
            { $sort: { lastTime: -1 } }
        ]);
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Messages for a specific contact
router.get("/messages/:number", auth, async (req, res) => {
    try {
        const { number } = req.params;
        const messages = await Message.find({
            userId: req.user.id,
            from: number
        }).sort({ timestamp: 1 });

        // Mark as read
        await Message.updateMany(
            { userId: req.user.id, from: number, direction: 'incoming' },
            { isRead: true }
        );

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Reply via Chat
router.post("/send", auth, async (req, res) => {
    try {
        const { to, text } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || !user.metaCredentials.isVerified) {
            return res.status(400).json({ msg: "WhatsApp not connected" });
        }

        // 💰 Deduct for Chat Reply too?
        // Usually Service conversation messages are cheaper, but for simplicity/safety, we charge standard rate or FREE.
        // User asked for wallet deduction on delivery. Let's charge standard rate for now.
        const cost = user.pricing.perMessageCost;
        if (user.wallet.balance < cost) {
            return res.status(402).json({ msg: "Insufficient balance for reply." });
        }

        // Deduct First
        user.wallet.balance -= cost;
        user.wallet.transactions.push({
            type: 'debit',
            amount: cost,
            description: `Chat Reply to ${to}`,
            status: 'success',
            timestamp: new Date()
        });
        await user.save();

        try {
            // 1. Send via Meta API
            const result = await waService.sendTextMessage(
                user.metaCredentials.phoneNumberId,
                user.metaCredentials.accessToken,
                to,
                text
            );

            // 2. Save to DB
            const newMessage = new Message({
                userId: user._id,
                from: to,
                to: user.metaCredentials.phoneNumber,
                text: text,
                direction: 'outgoing'
            });
            await newMessage.save();

            res.json({ success: true, data: result, msg: newMessage });

        } catch (e) {
            // Refund if API fails
            user.wallet.balance += cost;
            // Remove the transaction or add a credit? adding credit is safer audit trail.
            user.wallet.transactions.push({
                type: 'credit',
                amount: cost,
                description: `Refund: Failed Reply to ${to}`,
                status: 'success',
                timestamp: new Date()
            });
            await user.save();
            throw e; // Re-throw to catch block
        }

    } catch (err) {
        res.status(500).json({ error: err.message || err });
    }
});

module.exports = router;
