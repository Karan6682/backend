const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: String, required: true }, // Customer Number
    to: { type: String, required: true },   // Your Business Number
    text: { type: String },
    type: { type: String, default: 'text' }, // text, image, etc.
    direction: { type: String, enum: ['incoming', 'outgoing'], required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Which team member is handling this?
});

module.exports = mongoose.model('Message', MessageSchema);
