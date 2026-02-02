const mongoose = require("mongoose");

const ChatbotFlowSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    nodes: [{
        id: { type: String, required: true },
        type: { type: String, enum: ['trigger', 'message', 'question', 'condition', 'action'], required: true },
        data: {
            label: String,
            message: String,
            buttons: [{ text: String, nextNode: String }],
            condition: String,
            delay: Number
        },
        position: { x: Number, y: Number }
    }],
    edges: [{
        id: String,
        source: String,
        target: String,
        label: String
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatbotFlow", ChatbotFlowSchema);
