const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const Campaign = require("../models/campaign.model"); // Assuming you store logs here or separately
const auth = require("../middlewares/auth.middleware");

// Get Detailed Reports
router.get("/summary", auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        // Date Filter
        const query = { userId };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59))
            };
        }

        const campaigns = await Campaign.find(query);

        // Aggregate Data
        let totalSent = 0;
        let totalDelivered = 0;
        let totalRead = 0;
        let totalFailed = 0;
        let totalCost = 0;

        campaigns.forEach(c => {
            totalSent += c.sentCount || 0;
            totalDelivered += c.deliveredCount || 0;
            totalRead += c.readCount || 0;
            totalFailed += c.failedCount || 0;

            // Calculate Cost (Approximation based on delivered * current rate, 
            // ideally should be stored per campaign but we use current user rate or store cost in campaign)
            // For now, let's fetch actual wallet debits for accuracy or estimate
        });

        // Fetch Wallet Debits for accurate cost in range
        const user = await User.findById(userId);
        const debitTxns = user.wallet.transactions.filter(t => {
            const tDate = new Date(t.timestamp);
            const inRange = (!startDate || tDate >= new Date(startDate)) &&
                (!endDate || tDate <= new Date(new Date(endDate).setHours(23, 59, 59)));
            return t.type === 'debit' && inRange;
        });

        totalCost = debitTxns.reduce((acc, t) => acc + t.amount, 0);

        res.json({
            campaignsCount: campaigns.length,
            messages: {
                sent: totalSent,
                delivered: totalDelivered,
                read: totalRead,
                failed: totalFailed
            },
            cost: totalCost,
            campaignData: campaigns // List for table
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
