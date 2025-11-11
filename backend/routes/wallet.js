const express = require('express');
const Razorpay = require('razorpay');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
});

// Create deposit order
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `deposit_${req.user._id}_${Date.now()}`
    });

    res.json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify deposit payment
router.post('/verify-deposit', auth, async (req, res) => {
  try {
    const { paymentId, amount, paymentMethod } = req.body;
    
    // Update user wallet
    const user = await User.findById(req.user._id);
    user.walletBalance += amount;
    
    // First deposit bonus
    if (!user.depositMade && amount >= 300) {
      user.walletBalance += 100; // Cashback
      user.depositMade = true;
      user.cashbackReceived = true;
      
      // Record cashback transaction
      const cashbackTransaction = await new Transaction({
        user: user._id,
        type: 'cashback',
        amount: 100,
        description: 'First deposit cashback'
      }).save();
      
      // Emit real-time update
      if (global.io) {
        global.io.emit('newTransaction', {
          id: cashbackTransaction._id,
          type: cashbackTransaction.type,
          amount: cashbackTransaction.amount,
          user: user.email,
          createdAt: cashbackTransaction.createdAt
        });
      }
    }
    
    await user.save();

    // Record deposit transaction
    const transaction = await new Transaction({
      user: user._id,
      type: 'deposit',
      amount,
      paymentId,
      description: `Wallet deposit via ${paymentMethod || 'Card'}`
    }).save();
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('newTransaction', {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        user: user.email,
        createdAt: transaction.createdAt
      });
    }

    res.json({ walletBalance: user.walletBalance, message: 'Deposit successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;