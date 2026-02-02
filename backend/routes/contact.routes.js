const express = require("express");
const router = express.Router();
const Contact = require("../models/contact.model");
const Message = require("../models/message.model");
const auth = require("../middlewares/auth.middleware");

// Get all contacts with filters
router.get("/", auth, async (req, res) => {
    try {
        const { tag, search, status } = req.query;
        let query = { userId: req.user.id };

        if (tag) query.tags = tag;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { phoneNumber: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        const contacts = await Contact.find(query).sort({ updatedAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get or create contact
router.post("/get-or-create", auth, async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        let contact = await Contact.findOne({ userId: req.user.id, phoneNumber });

        if (!contact) {
            contact = new Contact({
                userId: req.user.id,
                phoneNumber,
                source: 'chat'
            });
            await contact.save();
        }

        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update contact (add tags, notes, etc.)
router.put("/:id", auth, async (req, res) => {
    try {
        const { name, email, tags, notes, customFields } = req.body;
        const contact = await Contact.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                name,
                email,
                tags,
                notes,
                customFields,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!contact) return res.status(404).json({ msg: "Contact not found" });
        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add tag to contact
router.post("/:id/tag", auth, async (req, res) => {
    try {
        const { tag } = req.body;
        const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.id });

        if (!contact) return res.status(404).json({ msg: "Contact not found" });

        if (!contact.tags.includes(tag)) {
            contact.tags.push(tag);
            await contact.save();
        }

        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove tag from contact
router.delete("/:id/tag/:tag", auth, async (req, res) => {
    try {
        const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.id });

        if (!contact) return res.status(404).json({ msg: "Contact not found" });

        contact.tags = contact.tags.filter(t => t !== req.params.tag);
        await contact.save();

        res.json(contact);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all unique tags
router.get("/tags/list", auth, async (req, res) => {
    try {
        const tags = await Contact.distinct('tags', { userId: req.user.id });
        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk import contacts
router.post("/bulk-import", auth, async (req, res) => {
    try {
        const { contacts } = req.body; // Array of {phoneNumber, name, tags}

        const results = await Promise.all(contacts.map(async (c) => {
            let contact = await Contact.findOne({
                userId: req.user.id,
                phoneNumber: c.phoneNumber
            });

            if (contact) {
                // Update existing
                contact.name = c.name || contact.name;
                if (c.tags) contact.tags = [...new Set([...contact.tags, ...c.tags])];
                await contact.save();
                return { status: 'updated', contact };
            } else {
                // Create new
                contact = new Contact({
                    userId: req.user.id,
                    phoneNumber: c.phoneNumber,
                    name: c.name,
                    tags: c.tags || [],
                    source: 'import'
                });
                await contact.save();
                return { status: 'created', contact };
            }
        }));

        res.json({
            success: true,
            imported: results.length,
            created: results.filter(r => r.status === 'created').length,
            updated: results.filter(r => r.status === 'updated').length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
