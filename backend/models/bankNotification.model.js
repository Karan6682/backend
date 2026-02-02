const mongoose = require("mongoose");

const BankNotificationSchema = new mongoose.Schema({
    sender: { type: String }, // Phone number or Bank name (e.g., "SBI", "HDFC")
    content: { type: String, required: true }, // Full SMS text
    amount: { type: Number },
    utr: { type: String, unique: true }, // Unique Transaction Reference
    isProcessed: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BankNotification", BankNotificationSchema);
