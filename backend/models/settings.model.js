const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
    type: { type: String, required: true, unique: true }, // e.g., 'payment'
    data: { type: Object, required: true }
});

module.exports = mongoose.model("Settings", SettingsSchema);
