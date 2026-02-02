const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    templateName: { type: String, required: true },
    totalContacts: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 }, // For Blue Ticks
    failedCount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "running", "completed", "failed"], default: "pending" },
    logs: [
        {
            number: String,
            messageId: String, // Critical for Webhook matching
            status: String, // sent, delivered, read, failed
            error: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Campaign", CampaignSchema);
