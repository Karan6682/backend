const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'agent'], default: 'user' }, // User (Business), Admin, Agent
    parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For Agents: Links to boss
    company: { type: String },
    businessProfile: {
        logo: { type: String }, // URL to logo
        address: { type: String },
        website: { type: String },
        gst: { type: String }
    },
    // For Admin: To show where to receive money
    // For User: Not currently used, but could be for refunds
    paymentInfo: {
        upiId: { type: String },
        receiverName: { type: String }
    },
    metaCredentials: {
        wabaId: { type: String },
        phoneNumberId: { type: String },
        accessToken: { type: String },
        appId: { type: String },
        appSecret: { type: String },
        phoneNumber: { type: String },
        isVerified: { type: Boolean, default: false }
    },
    wallet: {
        balance: { type: Number, default: 0 }, // Start with 0 for realism
        currency: { type: String, default: 'INR' },
        transactions: [{
            type: { type: String, enum: ['credit', 'debit'], required: true },
            amount: { type: Number, required: true },
            description: { type: String },
            referenceId: { type: String }, // Payment Trans ID
            status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
            campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
            messageId: { type: String },
            screenshot: { type: String }, // Path to payment proof
            timestamp: { type: Date, default: Date.now }
        }]
    },
    pricing: {
        perMessageCost: { type: Number, default: 0.50 } // ₹0.50 per delivered message
    },
    apiKey: { type: String, unique: true, sparse: true }, // External API Key
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
