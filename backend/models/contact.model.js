const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phoneNumber: { type: String, required: true },
    name: { type: String },
    email: { type: String },
    tags: [{ type: String }], // ['Hot Lead', 'VIP', 'Interested']
    customFields: { type: Map, of: String }, // Flexible custom data
    lastContacted: { type: Date },
    totalMessages: { type: Number, default: 0 },
    notes: { type: String },
    source: { type: String, enum: ['manual', 'campaign', 'chat', 'import'], default: 'manual' },
    status: { type: String, enum: ['active', 'blocked', 'archived'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index for fast queries
ContactSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });
ContactSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model('Contact', ContactSchema);
