const mongoose = require("mongoose");

const AutomationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    trigger: {
        type: { type: String, enum: ['keyword', 'reply_button'], required: true },
        content: { type: String, required: true } // e.g. "PRICE"
    },
    action: {
        type: { type: String, enum: ['send_template', 'send_text', 'assign_agent'], required: true },
        content: { type: String }, // template_name or text body
        metadata: { type: Object } // Extra component data
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Automation", AutomationSchema);
