const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const waService = require("../services/whatsapp.service");
const mongoose = require("mongoose");

// Middleware to validate API Key
const validateApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: "Missing x-api-key header" });

    try {
        const user = await User.findOne({ apiKey });
        if (!user) return res.status(401).json({ error: "Invalid API Key" });
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: "Auth Error" });
    }
};

// Send Message (External API)
router.post("/send-message", validateApiKey, async (req, res) => {
    try {
        const { to, templateName, params } = req.body;
        // params: ["Param1", "Param2"...]

        if (!to || !templateName) {
            return res.status(400).json({ error: "Missing 'to' or 'templateName'" });
        }

        const user = req.user;

        // 1. Check & Deduct Balance
        const cost = user.pricing.perMessageCost;
        if (user.wallet.balance < cost) {
            return res.status(402).json({
                error: "Insufficient Wallet Balance",
                balance: user.wallet.balance,
                required: cost
            });
        }

        user.wallet.balance -= cost;
        user.wallet.transactions.push({
            type: 'debit',
            amount: cost,
            description: `API Send to ${to}`,
            status: 'success',
            timestamp: new Date()
        });
        await user.save();

        // 2. Send Message
        try {
            const components = params ? [{
                type: "body",
                parameters: params.map(p => ({ type: "text", text: p }))
            }] : [];

            const result = await waService.sendTemplateMessage(
                user.metaCredentials.phoneNumberId,
                user.metaCredentials.accessToken,
                to,
                templateName,
                components
            );

            res.json({
                success: true,
                messageId: result.messages?.[0]?.id,
                cost_deducted: cost,
                remaining_balance: user.wallet.balance
            });

        } catch (e) {
            // Refund
            const freshUser = await User.findById(user._id);
            freshUser.wallet.balance += cost;
            freshUser.wallet.transactions.push({
                type: 'credit',
                amount: cost,
                description: `Refund: API Failed to ${to}`,
                status: 'success'
            });
            await freshUser.save();

            res.status(500).json({
                success: false,
                error: e.message || "Meta API Failed",
                refunded: true
            });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate/Get API Key (Internal usage for frontend)
router.post("/generate-key", async (req, res) => {
    // This route needs standard AUTH, not API Key
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ msg: "No token" });

    try {
        const jwt = require("jsonwebtoken"); // Lazy load
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        // Generate random key
        const crypto = require('crypto');
        const newKey = 'sk_live_' + crypto.randomBytes(16).toString('hex');

        user.apiKey = newKey;
        await user.save();

        res.json({ apiKey: newKey });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
