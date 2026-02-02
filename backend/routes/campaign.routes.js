const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const Campaign = require("../models/campaign.model");
const jwt = require("jsonwebtoken");
const waService = require("../services/whatsapp.service");

const auth = require("../middlewares/auth.middleware");

// Create and Start Campaign
router.post("/start", auth, async (req, res) => {
    try {
        const { name, templateName, contacts } = req.body; // contacts: [{number, params: []}]
        const user = await User.findById(req.user.id);

        if (!user || !user.metaCredentials.isVerified) {
            return res.status(400).json({ msg: "WhatsApp not connected" });
        }

        // 1. 💰 CHECK WALLET BALANCE & DEDUCT UPFRONT
        const perMsgCost = user.pricing.perMessageCost;
        const totalEstimatedCost = contacts.length * perMsgCost;

        if (user.wallet.balance < totalEstimatedCost) {
            return res.status(402).json({ // 402 Payment Required
                msg: `Insufficient wallet balance.`,
                required: totalEstimatedCost,
                available: user.wallet.balance,
                shortfall: totalEstimatedCost - user.wallet.balance
            });
        }

        // Deduct Full Amount Immediately (Pre-paid)
        user.wallet.balance -= totalEstimatedCost;
        user.wallet.transactions.push({
            type: 'debit',
            amount: totalEstimatedCost,
            description: `Campaign: ${name} (${contacts.length} msgs)`,
            status: 'success',
            timestamp: new Date()
        });
        await user.save();

        const campaign = new Campaign({
            userId: user._id,
            name,
            templateName,
            totalContacts: contacts.length,
            status: "running"
        });
        await campaign.save();

        res.json({ msg: "Campaign started", campaignId: campaign._id, deducted: totalEstimatedCost });

        // Background process for bulk sending
        (async () => {
            let sent = 0;
            let failed = 0;
            let logs = [];

            for (let i = 0; i < contacts.length; i++) {
                const contact = contacts[i];
                let logEntry = { number: contact.number, status: "sent", timestamp: new Date() };
                try {
                    const components = contact.params ? [{
                        type: "body",
                        parameters: contact.params.map(p => ({ type: "text", text: p }))
                    }] : [];

                    const result = await waService.sendTemplateMessage(
                        user.metaCredentials.phoneNumberId,
                        user.metaCredentials.accessToken,
                        contact.number,
                        templateName,
                        components
                    );

                    // Meta returns: { messaging_product: "whatsapp", contacts: [...], messages: [{ id: "wamid.HBg..." }] }
                    if (result && result.messages && result.messages.length > 0) {
                        logEntry.messageId = result.messages[0].id;
                    }

                    sent++;
                    logEntry.status = "sent";
                } catch (e) {
                    console.error(`Failed to send to ${contact.number}:`, e);
                    failed++;
                    logEntry.status = "failed";
                    logEntry.error = e.message || JSON.stringify(e);
                }

                logs.push(logEntry);

                // Update progress every 5 messages or at the end
                if (i % 5 === 0 || i === contacts.length - 1) {
                    await Campaign.findByIdAndUpdate(campaign._id, {
                        sentCount: sent,
                        failedCount: failed,
                        status: i === contacts.length - 1 ? "completed" : "running",
                        logs: logs
                    });
                }

                // Small delay to prevent rate issues
                await new Promise(r => setTimeout(r, 1000));
            }

            // 2. 🔄 REFUND LOGIC FOR FAILED MESSAGES
            if (failed > 0) {
                const refundAmount = failed * perMsgCost;

                // Fetch fresh user to avoid version error
                const freshUser = await User.findById(user._id);
                freshUser.wallet.balance += refundAmount;
                freshUser.wallet.transactions.push({
                    type: 'credit',
                    amount: refundAmount,
                    description: `Refund: ${failed} failed msgs in '${name}'`,
                    status: 'success',
                    timestamp: new Date()
                });
                await freshUser.save();
                console.log(`Refunded ₹${refundAmount} for ${failed} failed messages.`);
            }

        })();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Campaigns
router.get("/list", auth, async (req, res) => {
    try {
        const campaigns = await Campaign.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
