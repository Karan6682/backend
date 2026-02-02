const express = require("express");
const router = express.Router();
const Automation = require("../models/automation.model");
const auth = require("../middlewares/auth.middleware");

// Get all automations
router.get("/", auth, async (req, res) => {
    try {
        const rules = await Automation.find({ userId: req.user.id });
        res.json(rules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new automation
router.post("/create", auth, async (req, res) => {
    try {
        const { name, trigger, action } = req.body;
        const newRule = new Automation({
            userId: req.user.id,
            name,
            trigger,
            action
        });
        await newRule.save();
        res.json(newRule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle status
router.put("/toggle/:id", auth, async (req, res) => {
    try {
        const rule = await Automation.findOne({ _id: req.params.id, userId: req.user.id });
        if (!rule) return res.status(404).json({ msg: "Not found" });

        rule.isActive = !rule.isActive;
        await rule.save();
        res.json(rule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete
router.delete("/delete/:id", auth, async (req, res) => {
    try {
        await Automation.deleteOne({ _id: req.params.id, userId: req.user.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
