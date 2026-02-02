const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const auth = require("../middlewares/auth.middleware");

// Update Meta Credentials
router.post("/update-meta", auth, async (req, res) => {
    try {
        const { wabaId, phoneNumberId, accessToken, appId, appSecret, phoneNumber } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.metaCredentials = {
            wabaId,
            phoneNumberId,
            accessToken,
            appId,
            appSecret,
            phoneNumber,
            isVerified: req.body.isVerified ?? false
        };

        await user.save();
        res.json(user.metaCredentials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Current User Meta Info
router.get("/meta", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("metaCredentials");
        res.json(user.metaCredentials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
