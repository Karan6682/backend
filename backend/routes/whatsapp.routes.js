const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const Message = require("../models/message.model");
const jwt = require("jsonwebtoken");
const waService = require("../services/whatsapp.service");
const axios = require("axios");

const auth = require("../middlewares/auth.middleware");

// Get Account Health Status
router.get("/health", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || (!user.metaCredentials.wabaId && !user.metaCredentials.accessToken)) {
            return res.status(400).json({ msg: "WhatsApp settings missing" });
        }

        const result = await waService.getAccountHealth(
            user.metaCredentials.wabaId,
            user.metaCredentials.accessToken
        );

        res.json(result);
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || err;
        res.status(500).json({ success: false, error: errorMsg });
    }
});

// Send Single Template Message
router.post("/send-template", auth, async (req, res) => {
    try {
        const { to, templateName, components } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || !user.metaCredentials.isVerified) {
            return res.status(400).json({ msg: "WhatsApp not connected" });
        }

        const result = await waService.sendTemplateMessage(
            user.metaCredentials.phoneNumberId,
            user.metaCredentials.accessToken,
            to,
            templateName,
            components
        );

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || err });
    }
});

// Send Single Media Message
router.post("/send-media", auth, async (req, res) => {
    try {
        const { to, type, link, caption } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || !user.metaCredentials.isVerified) {
            return res.status(400).json({ msg: "WhatsApp not connected" });
        }

        const result = await waService.sendMediaMessage(
            user.metaCredentials.phoneNumberId,
            user.metaCredentials.accessToken,
            to,
            type,
            link,
            caption
        );

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || err });
    }
});

// Get Message Templates
router.get("/templates", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.metaCredentials.isVerified) {
            return res.status(400).json({ msg: "WhatsApp not connected" });
        }

        const result = await waService.getTemplates(
            user.metaCredentials.wabaId,
            user.metaCredentials.accessToken
        );

        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || err });
    }
});

// Create Message Template
router.post("/templates/create", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.metaCredentials.isVerified) {
            return res.status(400).json({ msg: "WhatsApp not connected" });
        }

        const templateData = req.body; // Expects Meta's template JSON structure
        const result = await waService.createTemplate(
            user.metaCredentials.wabaId,
            user.metaCredentials.accessToken,
            templateData
        );

        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || err });
    }
});

// Delete Message Template
router.delete("/templates/delete/:name", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.metaCredentials.isVerified) {
            return res.status(400).json({ msg: "WhatsApp not connected" });
        }

        const result = await waService.deleteTemplate(
            user.metaCredentials.wabaId,
            user.metaCredentials.accessToken,
            req.params.name
        );

        res.json(result);
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || err;
        res.status(500).json({ success: false, error: errorMsg });
    }
});

// Exchange Token Route
router.post("/token-exchange", auth, async (req, res) => {
    try {
        const { appId: reqAppId, appSecret: reqAppSecret, shortToken } = req.body;

        // Use provided ones or fallback to user's saved ones
        const user = await User.findById(req.user.id);
        const appId = reqAppId || user?.metaCredentials?.appId || '1596025668076914';
        const appSecret = reqAppSecret || user?.metaCredentials?.appSecret || 'b47ef916c821344dff83c3ed82f3c881';

        const result = await waService.exchangeToken(appId, appSecret, shortToken);
        res.json({ success: true, longLivedToken: result.access_token });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || err });
    }
});

// Get Available Phone Numbers
router.get("/phone-numbers", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.metaCredentials.wabaId) {
            return res.status(400).json({ msg: "WABA ID not found" });
        }

        const result = await waService.getPhoneNumbers(
            user.metaCredentials.wabaId,
            user.metaCredentials.accessToken
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || err });
    }
});

// Discover WABA and Numbers from token
router.post("/discover", auth, async (req, res) => {
    try {
        let { accessToken } = req.body;
        if (accessToken) accessToken = accessToken.trim();

        const user = await User.findById(req.user.id);
        const appId = user?.metaCredentials?.appId || '1524119103055230';
        const appSecret = user?.metaCredentials?.appSecret || '9d4793570659207e9e80e608035ed870'; // Note: I need to find the correct appSecret too.

        // 1. Get All WABA IDs
        const wabaData = await waService.getWabaAccounts(accessToken, appId, appSecret);
        if (!wabaData.data || wabaData.data.length === 0) {
            return res.status(404).json({ error: "No WhatsApp Business Account found with this token." });
        }

        let allNumbers = [];
        let primaryWabaId = wabaData.data[0].id;
        let primaryWabaName = wabaData.data[0].name;

        // 2. Loop through all WABAs to find all numbers
        for (const waba of wabaData.data) {
            try {
                const numsData = await waService.getPhoneNumbers(waba.id, accessToken);
                if (numsData.data) {
                    // Tag numbers with their WABA ID so we know where they belong
                    const taggedNumbers = numsData.data.map(n => ({ ...n, wabaId: waba.id }));
                    allNumbers = [...allNumbers, ...taggedNumbers];

                    // If we find the user's specific number, make this the primary WABA
                    if (taggedNumbers.some(n => n.display_phone_number.includes('8168625627'))) {
                        primaryWabaId = waba.id;
                    }
                }
            } catch (e) {
                console.error(`Error fetching numbers for WABA ${waba.id}:`, e.message);
            }
        }

        res.json({
            wabaId: primaryWabaId,
            wabaName: primaryWabaName,
            numbers: allNumbers
        });
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || err;
        res.status(500).json({ error: errorMsg });
    }
});

// Request OTP
router.post("/otp-request", auth, async (req, res) => {
    try {
        const { phoneNumberId, method } = req.body;
        const user = await User.findById(req.user.id);
        const result = await waService.requestCode(
            phoneNumberId,
            user.metaCredentials.accessToken,
            method
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

// Verify OTP
router.post("/otp-verify", auth, async (req, res) => {
    try {
        const { phoneNumberId, code } = req.body;
        const user = await User.findById(req.user.id);
        const result = await waService.verifyCode(
            phoneNumberId,
            user.metaCredentials.accessToken,
            code
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

// Add number to WABA
router.post("/add-number", auth, async (req, res) => {
    try {
        const { wabaId, cc, phoneNumber, accessToken, verifiedName } = req.body;
        const result = await waService.addPhoneNumber(wabaId, accessToken, cc, phoneNumber, verifiedName);
        res.json(result);
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || err;
        res.status(500).json({ error: errorMsg });
    }
});

// Delete number from WABA
router.delete("/delete-number/:numberId", auth, async (req, res) => {
    try {
        const { accessToken } = req.query; // Send token in query for DELETEs or body
        const result = await waService.deletePhoneNumber(req.params.numberId, accessToken);
        res.json(result);
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || err;
        res.status(500).json({ error: errorMsg });
    }
});

// Get Detailed Number Status
router.get("/number-status/:phoneNumberId", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const accessToken = user.metaCredentials.accessToken;

        try {
            console.log(`[DEBUG] ID Received: '${req.params.phoneNumberId}'`);
            console.log(`[DEBUG] Token: ${accessToken ? accessToken.substring(0, 10) + '...' : 'MISSING'}`);

            const response = await axios.get(
                `https://graph.facebook.com/v19.0/${req.params.phoneNumberId.trim()}`,
                {
                    params: {
                        fields: 'verified_name,code_verification_status,quality_rating,name_status,status',
                        access_token: accessToken
                    }
                }
            );
            res.json(response.data);
        } catch (apiErr) {
            console.log("Full Error Response:", JSON.stringify(apiErr.response?.data, null, 2));
            // If token is invalid, catch it here
            if (apiErr.response?.data?.error?.code === 190) {
                return res.status(401).json({ error: "Meta Token Expired. Please get a new Permanent Token." });
            }
            throw apiErr;
        }
    } catch (err) {
        const errorData = err.response?.data || err.message;
        res.status(500).json({ error: errorData });
    }
});

// Register phone number (Final step)
router.post("/register", auth, async (req, res) => {
    try {
        let { phoneNumberId } = req.body;
        phoneNumberId = phoneNumberId ? phoneNumberId.toString().trim() : phoneNumberId;

        const user = await User.findById(req.user.id);
        const accessToken = user.metaCredentials.accessToken;

        const result = await waService.registerNumber(phoneNumberId, accessToken);
        res.json(result);
    } catch (err) {
        // Unwrap Meta API error if present
        const errorData = err.response?.data || err.error || err;
        const errorMessage = errorData.message || JSON.stringify(errorData);
        res.status(500).json({ error: { message: errorMessage } });
    }
});

// Update Business Profile
router.post("/profile-update", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || (!user.metaCredentials.phoneNumberId && !user.metaCredentials.accessToken)) {
            return res.status(400).json({ msg: "WhatsApp settings missing" });
        }

        const result = await waService.updateBusinessProfile(
            user.metaCredentials.phoneNumberId,
            user.metaCredentials.accessToken,
            req.body
        );

        res.json({ success: true, data: result });
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || err;
        res.status(500).json({ success: false, error: errorMsg });
    }
});

// Get Business Profile
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || (!user.metaCredentials.phoneNumberId && !user.metaCredentials.accessToken)) {
            return res.status(400).json({ msg: "WhatsApp settings missing" });
        }

        const result = await waService.getBusinessProfile(
            user.metaCredentials.phoneNumberId,
            user.metaCredentials.accessToken
        );

        res.json({ success: true, data: result });
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || err;
        res.status(500).json({ success: false, error: errorMsg });
    }
});

// Get Messaging Analytics
router.get("/analytics", auth, async (req, res) => {
    try {
        const { start, end, granularity } = req.query;
        const user = await User.findById(req.user.id);
        if (!user || !user.metaCredentials.wabaId) {
            return res.status(400).json({ msg: "WABA ID missing" });
        }

        const result = await waService.getMessagingAnalytics(
            user.metaCredentials.wabaId,
            user.metaCredentials.accessToken,
            start || Math.floor(Date.now() / 1000) - 6 * 24 * 3600, // Default 7 days ago
            end || Math.floor(Date.now() / 1000),
            granularity || 'DAY'
        );

        res.json({ success: true, data: result });
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || err;
        res.status(500).json({ success: false, error: errorMsg });
    }
});

// Set Two-Step Verification
router.post("/two-step-verification", auth, async (req, res) => {
    try {
        const { pin } = req.body;
        const user = await User.findById(req.user.id);
        if (!user || !user.metaCredentials.phoneNumberId) {
            return res.status(400).json({ msg: "Phone Number ID missing" });
        }

        const result = await waService.setTwoStepVerification(
            user.metaCredentials.phoneNumberId,
            user.metaCredentials.accessToken,
            pin
        );

        res.json({ success: true, data: result });
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message || err;
        res.status(500).json({ success: false, error: errorMsg });
    }
});

const Campaign = require("../models/campaign.model"); // Import Campaign model

// ----------------------------------------------------
// WEBHOOK ROUTES (Verification & Event Handling)
// ----------------------------------------------------

// 1. Verification (GET)
router.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Use the token from .env
    const META_WEBHOOK_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "whatsapp_crm_webhook_token";

    if (mode && token) {
        if (mode === "subscribe" && token === META_WEBHOOK_TOKEN) {
            console.log("✅ WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            console.log("❌ WEBHOOK_VERIFICATION_FAILED", { received: token, expected: META_WEBHOOK_TOKEN });
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// 2. Event Handling (POST) - Status Updates
router.post("/webhook", async (req, res) => {
    console.log("📩 Webhook Received:", JSON.stringify(req.body, null, 2));
    try {
        const body = req.body;

        // Check if this is an event from a WhatsApp subscription
        if (body.object === "whatsapp_business_account") {

            // Iterate over each entry
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    const value = change.value;

                    // Handle Message Status Updates (Sent, Delivered, Read, Failed)
                    if (value.statuses) {
                        for (const status of value.statuses) {
                            const messageId = status.id;
                            const statusState = status.status; // sent, delivered, read, failed

                            // Find Campaign containing this messageId
                            const campaign = await Campaign.findOne({ "logs.messageId": messageId });

                            if (campaign) {
                                // Update specific log entry
                                const logIndex = campaign.logs.findIndex(l => l.messageId === messageId);
                                if (logIndex !== -1) {
                                    const oldStatus = campaign.logs[logIndex].status;

                                    // Update Log Status
                                    campaign.logs[logIndex].status = statusState;

                                    // Update Counters based on state transition
                                    // Note: This is simplified. Ideally handle transitions strictly to avoid double counting if duplicate webhooks arrive.
                                    if (statusState === 'delivered' && oldStatus !== 'delivered' && oldStatus !== 'read') {
                                        campaign.deliveredCount += 1;

                                        // Status Update Only
                                        console.log(`Msg Delivered: ${messageId}`);

                                    } else if (statusState === 'read' && oldStatus !== 'read') {
                                        campaign.readCount += 1;
                                        // If previously delivered, maybe don't decrement delivered, as "read" implies delivered.
                                        // Usually Dashboard shows: Sent, Delivered, Read. A message can be both Delivered and Read.
                                    } else if (statusState === 'failed' && oldStatus !== 'failed') {
                                        campaign.failedCount += 1;
                                        campaign.logs[logIndex].error = JSON.stringify(status.errors || "Unknown Error");
                                    }

                                    await campaign.save();
                                    console.log(`Updated Campaign ${campaign.name}: Msg ${statusState}`);
                                }
                            }
                        }
                    }

                    // Handle Incoming Messages (Chat)
                    if (value.messages) {
                        const Automation = require("../models/automation.model"); // Lazy load

                        for (const message of value.messages) {
                            try {
                                const from = message.from; // Customer number
                                const phoneNumberId = value.metadata.phone_number_id;
                                const textBody = message.text?.body || (message.type === 'image' ? '[Image]' : `[${message.type}]`);

                                // Find user by phoneNumberId so we know whose chat this is
                                const user = await User.findOne({ "metaCredentials.phoneNumberId": phoneNumberId });
                                if (user) {
                                    const newMessage = new Message({
                                        userId: user._id,
                                        from: from,
                                        to: user.metaCredentials.phoneNumber,
                                        text: textBody,
                                        direction: 'incoming',
                                        timestamp: new Date()
                                    });
                                    await newMessage.save();

                                    // 📇 AUTO-CREATE/UPDATE CONTACT
                                    const Contact = require("../models/contact.model");
                                    let contact = await Contact.findOne({ userId: user._id, phoneNumber: from });
                                    if (!contact) {
                                        contact = new Contact({
                                            userId: user._id,
                                            phoneNumber: from,
                                            source: 'chat',
                                            lastContacted: new Date(),
                                            totalMessages: 1
                                        });
                                        await contact.save();
                                        console.log(`✨ New contact created: ${from}`);
                                    } else {
                                        contact.lastContacted = new Date();
                                        contact.totalMessages += 1;
                                        await contact.save();
                                    }

                                    // Real-time notify via Socket.io
                                    const io = req.app.get('socketio'); // Get io instance
                                    if (io) {
                                        io.to(user._id.toString()).emit('new_message', newMessage);
                                        console.log(`📩 New message for ${user.name} from ${from}`);
                                    }

                                    // ⚡ AUTOMATION TRIGGER CHECK ⚡
                                    if (message.type === 'text') {
                                        const rules = await Automation.find({ userId: user._id, isActive: true });
                                        for (const rule of rules) {
                                            if (textBody.toUpperCase().includes(rule.trigger.content)) {
                                                console.log(`⚡ Automation Triggered: ${rule.name}`);

                                                if (rule.action.type === 'send_template') {
                                                    // Send Template
                                                    await waService.sendTemplateMessage(
                                                        user.metaCredentials.phoneNumberId,
                                                        user.metaCredentials.accessToken,
                                                        from,
                                                        rule.action.content
                                                    );

                                                    // Log Auto-Reply
                                                    const autoMsg = new Message({
                                                        userId: user._id,
                                                        from: from,
                                                        to: user.metaCredentials.phoneNumber,
                                                        text: `[Auto-Reply Template: ${rule.action.content}]`,
                                                        direction: 'outgoing',
                                                        timestamp: new Date()
                                                    });
                                                    await autoMsg.save();
                                                    if (io) io.to(user._id.toString()).emit('new_message', autoMsg); // Update UI
                                                }
                                            }
                                        }
                                    }

                                } else {
                                    console.warn(`❓ Received message for unknown phone number ID: ${phoneNumberId}`);
                                }
                            } catch (msgErr) {
                                console.error("Error processing incoming message:", msgErr);
                            }
                        }
                    }

                    // Handle Template Status Updates
                    if (value.event && value.message_template_id) {
                        const event = value.event; // APPROVED, REJECTED, etc.
                        const templateName = value.message_template_name;
                        const reason = value.reason;

                        console.log(`🔔 Template Update: ${templateName} is now ${event}${reason ? ' (Reason: ' + reason + ')' : ''}`);

                        // We could notify the user via socket.io if we knew which user owned this template
                        // Usually templates are per WABA, so we find the user by wabaId
                        const user = await User.findOne({ "metaCredentials.wabaId": entry.id });
                        if (user) {
                            const io = req.app.get('socketio');
                            if (io) {
                                io.to(user._id.toString()).emit('template_update', {
                                    name: templateName,
                                    status: event,
                                    reason: reason
                                });
                            }
                        }
                    }
                }
            }

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        console.error("Webhook Error:", err.message);
        res.sendStatus(500);
    }
});

module.exports = router;
