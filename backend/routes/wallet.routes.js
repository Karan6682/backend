const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const auth = require("../middlewares/auth.middleware");
const multer = require("multer");
const path = require("path");
const paymentService = require("../services/payment.service");

// Configure Multer for Screenshots
const storage = multer.diskStorage({
    destination: "./public/uploads/screenshots",
    filename: (req, file, cb) => {
        cb(null, `proof-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Get Wallet Balance
router.get("/balance", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({
            balance: user.wallet.balance,
            currency: user.wallet.currency,
            perMessageCost: user.pricing.perMessageCost,
            isAdmin: user.role === 'admin', // Send Role check for UI
            transactions: user.wallet.transactions.slice(-10) // Last 10 transactions
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Recharge Wallet (User submits payment reference or screenshot)
router.post("/recharge", auth, upload.single('screenshot'), async (req, res) => {
    try {
        const { amount, description, referenceId } = req.body;
        const screenshotPath = req.file ? `/uploads/screenshots/${req.file.filename}` : null;

        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: "Invalid amount" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Record transaction as PENDING
        user.wallet.transactions.push({
            type: 'credit',
            amount: parseFloat(amount),
            description: description || `Wallet Top-up Request`,
            referenceId: referenceId || 'SCREENSHOT_ONLY',
            status: 'pending',
            screenshot: screenshotPath,
            timestamp: new Date()
        });

        await user.save();

        res.json({
            success: true,
            message: `Request Submitted! Admin will verify your screenshot/UTR soon.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get Pending Requests
router.get("/pending-requests", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') return res.status(403).json({ msg: "Admin only" });

        // Find all users who have 'pending' transactions
        const users = await User.find({ "wallet.transactions.status": "pending" });

        let pendingTxns = [];
        users.forEach(u => {
            u.wallet.transactions.forEach(tx => {
                if (tx.status === 'pending') {
                    pendingTxns.push({
                        userId: u._id,
                        userName: u.name,
                        userEmail: u.email, // Added Email
                        transactionId: tx._id,
                        amount: tx.amount,
                        referenceId: tx.referenceId,
                        screenshot: tx.screenshot, // Added screenshot for admin review
                        date: tx.timestamp
                    });
                }
            });
        });

        res.json(pendingTxns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Approve Transaction
router.post("/approve-request", auth, async (req, res) => {
    try {
        const { userId, transactionId, action } = req.body; // action: 'approve' or 'reject'
        const admin = await User.findById(req.user.id);
        if (admin.role !== 'admin') return res.status(403).json({ msg: "Admin only" });

        const targetUser = await User.findById(userId);
        if (!targetUser) return res.status(404).json({ msg: "User not found" });

        const txIndex = targetUser.wallet.transactions.findIndex(t => t._id.toString() === transactionId);
        if (txIndex === -1) return res.status(404).json({ msg: "Transaction not found" });

        if (action === 'approve') {
            targetUser.wallet.transactions[txIndex].status = 'success';
            targetUser.wallet.balance += targetUser.wallet.transactions[txIndex].amount;
        } else {
            targetUser.wallet.transactions[txIndex].status = 'failed';
        }

        await targetUser.save();
        res.json({ success: true, message: `Transaction ${action}d` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update UPI Settings
router.post("/admin/upi", auth, async (req, res) => {
    try {
        const { upiId, receiverName } = req.body;
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') return res.status(403).json({ msg: "Admin only" });

        user.paymentInfo = { upiId, receiverName };
        await user.save();
        res.json({ success: true, paymentInfo: user.paymentInfo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: Get ALL Transaction History (Audit Log)
router.get("/admin/history", auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (admin.role !== 'admin') return res.status(403).json({ msg: "Admin only" });

        // Aggregate All Transactions
        const users = await User.find({ "wallet.transactions": { $exists: true, $ne: [] } });
        let allTxns = [];

        users.forEach(u => {
            u.wallet.transactions.forEach(tx => {
                // Filter only relevant ones if needed, or show all
                if (tx.status === 'success' && tx.type === 'credit') { // Showing only money IN for now
                    allTxns.push({
                        userId: u._id,
                        userName: u.name,
                        userEmail: u.email,
                        amount: tx.amount,
                        referenceId: tx.referenceId,
                        date: tx.timestamp,
                        description: tx.description
                    });
                }
            });
        });

        // Sort by newest
        allTxns.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allTxns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: Get Total Revenue Stats
router.get("/admin/stats", auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (admin.role !== 'admin') return res.status(403).json({ msg: "Admin only" });

        const users = await User.find({});
        let totalRevenue = 0;

        users.forEach(u => {
            u.wallet.transactions.forEach(tx => {
                if (tx.status === 'success' && tx.type === 'credit') {
                    totalRevenue += tx.amount;
                }
            });
        });

        res.json({ totalRevenue });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Public/User: Get Admin UPI
router.get("/admin/upi-info", auth, async (req, res) => {
    try {
        // Find the first admin user
        const admin = await User.findOne({ role: 'admin' });
        if (admin && admin.paymentInfo) {
            res.json(admin.paymentInfo);
        } else {
            res.json({ upiId: 'admin@upi', receiverName: 'Admin' }); // Fallback
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: Update Pricing (Restored)
router.post("/update-pricing", auth, async (req, res) => {
    try {
        const { perMessageCost } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // ADMIN CHECK
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: "Access Denied: Admins Only" });
        }

        if (!perMessageCost || perMessageCost < 0) {
            return res.status(400).json({ msg: "Invalid cost value" });
        }

        // Update pricing
        user.pricing.perMessageCost = perMessageCost;
        await user.save();

        res.json({
            success: true,
            message: `Per-message cost updated to ₹${perMessageCost}`,
            newCost: perMessageCost
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Deduct from Wallet (Internal)
router.post("/deduct", auth, async (req, res) => {
    try {
        const { amount, description, campaignId, messageId } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (user.wallet.balance < amount) {
            return res.status(400).json({ msg: "Insufficient balance" });
        }

        // Deduct amount
        user.wallet.balance -= amount;

        // Record transaction
        user.wallet.transactions.push({
            type: 'debit',
            amount: amount,
            description: description || `Message Delivered`,
            campaignId: campaignId,
            messageId: messageId,
            timestamp: new Date()
        });

        await user.save();

        res.json({
            success: true,
            newBalance: user.wallet.balance,
            deducted: amount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Transaction History
router.get("/transactions", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Return last 50 transactions
        const transactions = user.wallet.transactions
            // Add date sorting if not already sorted in push
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50);

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// 1. CREATE AUTOMATED ORDER (New)
router.post("/create-order", auth, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount < 1) return res.status(400).json({ msg: "Min recharge is ₹1" });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // IMPORTANT: We need ADMIN's UPI to receive money
        const admin = await User.findOne({ role: 'admin' });
        const upiId = admin?.paymentInfo?.upiId || 'admin@upi';
        const receiverName = admin?.paymentInfo?.receiverName || 'CloudCRM Admin';

        const order = await paymentService.createOrder(amount, user._id, user.name);

        // Save the pending order
        user.wallet.transactions.push({
            type: 'credit',
            amount: parseFloat(amount),
            description: `Automated Wallet Recharge (Auto-Verify)`,
            referenceId: order.orderId,
            status: 'pending',
            timestamp: new Date()
        });
        await user.save();

        res.json({
            success: true,
            orderId: order.orderId,
            upiUrl: `upi://pay?pa=${upiId}&pn=${encodeURIComponent(receiverName)}&am=${amount}&tr=${order.orderId}&cu=INR`
        });
    } catch (err) {
        console.error("CREATE ORDER ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. AUTO-VERIFY ORDER (No Admin Needed)
// This is called by frontend polling or by the user clicking "I have paid"
router.post("/verify-auto-order", auth, async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        // Check with Bank Aggregator (Secretly)
        const isPaid = await paymentService.verifyWithAggregator(orderId, amount);

        if (!isPaid) {
            return res.status(400).json({ success: false, msg: "Payment not found in bank records yet." });
        }

        const user = await User.findById(req.user.id);
        const txIndex = user.wallet.transactions.findIndex(t => t.referenceId === orderId && t.status === 'pending');

        if (txIndex !== -1) {
            // Success! Update balance automatically
            user.wallet.transactions[txIndex].status = 'success';
            user.wallet.transactions[txIndex].description = `Auto-Verified Payment (Gateway)`;
            user.wallet.balance += parseFloat(amount);
            await user.save();

            res.json({
                success: true,
                message: "Payment Verified Automatically! Funds Added.",
                newBalance: user.wallet.balance
            });
        } else {
            res.status(404).json({ msg: "Order not found or already processed." });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const BankNotification = require("../models/bankNotification.model");

// 1. SMART WEBHOOK (For your Private Android Gateway)
// Point your 'Notification to Webhook' app to this URL
router.post("/webhook/bank-sms", async (req, res) => {
    try {
        const { text, from } = req.body; // App sends SMS text and sender name
        if (!text) return res.status(400).send();

        console.log("Incoming SMS:", text);

        // --- SMART PARSING LOGIC ---
        // Match Amount: Finds strings like "Rs. 500", "INR 500.00", "credited with 500"
        const amtMatch = text.match(/(?:Rs|INR|amt|credited|of)\.?\s*([\d,]+\.?\d*)/i);
        const amount = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, '')) : 0;

        // Match UTR: 12-digit number common in UPI
        const utrMatch = text.match(/\b\d{12}\b/);
        const utr = utrMatch ? utrMatch[0] : `AUTO_${Date.now()}`;

        if (amount <= 0) return res.json({ status: "ignored", reason: "no amount found" });

        // Save notification for audit
        const notification = new BankNotification({ sender: from, content: text, amount, utr });

        // --- AUTO MATCHING LOGIC ---
        // Look for any user who has a 'pending' transaction of this EXACT amount
        // We look for any transaction created in the last 30 minutes
        const startTime = new Date(Date.now() - 30 * 60 * 1000);

        const userWithPending = await User.findOne({
            "wallet.transactions": {
                $elemMatch: {
                    amount: amount,
                    status: "pending",
                    timestamp: { $gte: startTime }
                }
            }
        });

        if (userWithPending) {
            const txIndex = userWithPending.wallet.transactions.findIndex(
                t => t.amount === amount && t.status === "pending" && t.timestamp >= startTime
            );

            if (txIndex !== -1) {
                userWithPending.wallet.balance += amount;
                userWithPending.wallet.transactions[txIndex].status = "success";
                userWithPending.wallet.transactions[txIndex].description = "Auto-Credit: Webhook Match";
                userWithPending.wallet.transactions[txIndex].referenceId = utr;
                notification.isProcessed = true;
                await userWithPending.save();
                console.log(`✅ Auto-Credited: ₹${amount} to ${userWithPending.name}`);
            }
        }

        await notification.save();
        res.json({ status: "success", parsed_amount: amount, matched: notification.isProcessed });

    } catch (err) {
        console.error("WEBHOOK ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. CHECK PAYMENT STATUS (For Frontend Polling)
router.get("/check-status/:utr", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const txn = user.wallet.transactions.find(t => t.referenceId === req.params.utr && t.status === 'success');

        if (txn) {
            res.json({ success: true, balance: user.wallet.balance });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
