const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth.middleware");

// Get all agents for current business owner
router.get("/", auth, async (req, res) => {
    try {
        const agents = await User.find({ parentUserId: req.user.id, role: 'agent' }).select("-password");
        res.json(agents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new agent
router.post("/add", auth, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let agent = await User.findOne({ email });
        if (agent) return res.status(400).json({ msg: "Email already taken" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Inherit boss's meta credentials so agent can send messages
        const boss = await User.findById(req.user.id);

        agent = new User({
            name,
            email,
            password: hashedPassword,
            role: 'agent',
            parentUserId: req.user.id,
            company: boss.company,
            metaCredentials: boss.metaCredentials,
            pricing: boss.pricing
        });

        await agent.save();
        res.json({ success: true, agent: { id: agent._id, name, email, role: 'agent' } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
