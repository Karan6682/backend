const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const auth = require("../middlewares/auth.middleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get Profile
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -wallet.transactions");
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Profile (Details)
router.post("/update", auth, async (req, res) => {
    try {
        const { company, address, website, gst } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: "User not found" });

        if (company) user.company = company;
        if (!user.businessProfile) user.businessProfile = {};

        user.businessProfile.address = address || user.businessProfile.address;
        user.businessProfile.website = website || user.businessProfile.website;
        user.businessProfile.gst = gst || user.businessProfile.gst;

        await user.save();
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Logo
router.post("/upload-logo", [auth, upload.single("logo")], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

    // URL construction (use configured BACKEND_URL or derive from request)
    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const logoUrl = `${baseUrl}/uploads/${req.file.filename}`;

        if (!user.businessProfile) user.businessProfile = {};
        user.businessProfile.logo = logoUrl;

        await user.save();
        res.json({ success: true, logoUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Role (Admin only - ideally strictly protected)
router.post("/set-role", auth, async (req, res) => {
    // Ideally check if requester IS admin, but for now open for setup or strict checking
    // Security Note: In production, hardcode an admin or use DB seed. 
    // Allowing anyone to become admin via API is risky.
    // For this MVP, we will only allow if specific secret is passed or just for manual usage.
    res.status(403).json({ msg: "Contact support to update roles" });
});

module.exports = router;
