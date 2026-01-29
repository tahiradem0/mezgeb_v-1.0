const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const router = express.Router();

// Get expenses with filters
router.get('/', auth, async (req, res) => {
    try {
        const { search, dateFrom, dateTo, amountMin, amountMax, categoryId } = req.query;
        let query = { userId: req.user._id };

        if (search) {
            query.reason = { $regex: search, $options: 'i' };
        }
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = new Date(dateFrom);
            if (dateTo) query.date.$lte = new Date(dateTo);
        }
        if (amountMin || amountMax) {
            query.amount = {};
            if (amountMin) query.amount.$gte = parseFloat(amountMin);
            if (amountMax) query.amount.$lte = parseFloat(amountMax);
        }
        if (categoryId) {
            query.categoryId = categoryId;
        }

        const expenses = await Expense.find(query).sort({ date: -1 }).populate('categoryId');
        res.json(expenses);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create expense
router.post('/', auth, async (req, res) => {
    try {
        const expense = new Expense({
            ...req.body,
            userId: req.user._id
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Update expense
router.patch('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!expense) return res.status(404).json();
        res.json(expense);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!expense) return res.status(404).json();
        res.json(expense);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
