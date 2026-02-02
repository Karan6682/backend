const express = require("express");
const router = express.Router();
const ChatbotFlow = require("../models/chatbot.model");
const auth = require("../middlewares/auth.middleware");

// Get all chatbot flows
router.get("/", auth, async (req, res) => {
    try {
        const flows = await ChatbotFlow.find({ userId: req.user.id });
        res.json(flows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new flow
router.post("/create", auth, async (req, res) => {
    try {
        const { name, nodes, edges } = req.body;
        const flow = new ChatbotFlow({
            userId: req.user.id,
            name,
            nodes: nodes || [],
            edges: edges || []
        });
        await flow.save();
        res.json(flow);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update flow
router.put("/:id", auth, async (req, res) => {
    try {
        const { name, nodes, edges, isActive } = req.body;
        const flow = await ChatbotFlow.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { name, nodes, edges, isActive, updatedAt: new Date() },
            { new: true }
        );
        res.json(flow);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete flow
router.delete("/:id", auth, async (req, res) => {
    try {
        await ChatbotFlow.deleteOne({ _id: req.params.id, userId: req.user.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Execute chatbot logic (called from webhook)
router.post("/execute", async (req, res) => {
    try {
        const { userId, flowId, userMessage, customerNumber } = req.body;

        const flow = await ChatbotFlow.findOne({ _id: flowId, userId, isActive: true });
        if (!flow) return res.json({ handled: false });

        // Find trigger node
        const triggerNode = flow.nodes.find(n => n.type === 'trigger');
        if (!triggerNode) return res.json({ handled: false });

        // Simple execution logic
        let currentNode = triggerNode;
        const responses = [];

        // Traverse flow (simplified)
        while (currentNode) {
            if (currentNode.type === 'message') {
                responses.push({
                    type: 'text',
                    message: currentNode.data.message
                });
            }

            // Find next node
            const edge = flow.edges.find(e => e.source === currentNode.id);
            if (!edge) break;

            currentNode = flow.nodes.find(n => n.id === edge.target);
        }

        res.json({ handled: true, responses });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
