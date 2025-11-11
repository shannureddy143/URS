const express = require('express');
const Rental = require('../models/Rental');
const Umbrella = require('../models/Umbrella');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Start rental
router.post('/start', auth, async (req, res) => {
  try {
    const { umbrellaId } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.depositMade) {
      return res.status(400).json({ message: 'Please make initial deposit first' });
    }

    const umbrella = await Umbrella.findById(umbrellaId);
    if (!umbrella || !umbrella.isAvailable) {
      return res.status(400).json({ message: 'Umbrella not available' });
    }

    const rental = new Rental({
      user: user._id,
      umbrella: umbrella._id
    });
    
    await rental.save();
    
    umbrella.isAvailable = false;
    umbrella.currentRental = rental._id;
    await umbrella.save();

    res.status(201).json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start multiple rentals
router.post('/start-multiple', auth, async (req, res) => {
  try {
    const { umbrellaIds } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.depositMade) {
      return res.status(400).json({ message: 'Please make initial deposit first' });
    }

    const umbrellas = await Umbrella.find({ 
      _id: { $in: umbrellaIds }, 
      isAvailable: true 
    });
    
    if (umbrellas.length !== umbrellaIds.length) {
      return res.status(400).json({ message: 'Some umbrellas are not available' });
    }

    const rentals = [];
    for (const umbrella of umbrellas) {
      const rental = new Rental({
        user: user._id,
        umbrella: umbrella._id
      });
      await rental.save();
      rentals.push(rental);
      
      umbrella.isAvailable = false;
      umbrella.currentRental = rental._id;
      await umbrella.save();
    }

    res.status(201).json({ rentals, count: rentals.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process payment and unlock
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;
    const rental = await Rental.findById(req.params.id).populate('umbrella user');
    
    if (!rental) return res.status(404).json({ message: 'Rental not found' });
    
    // Calculate current cost
    const hours = Math.ceil((new Date() - rental.startTime) / (1000 * 60 * 60));
    const currentCost = hours <= 7 ? (hours || 1) * 7 : Math.ceil(hours / 24) * 70;
    
    // Check wallet balance
    const user = await User.findById(rental.user._id);
    if (user.walletBalance < currentCost) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    
    // Deduct from wallet
    user.walletBalance -= currentCost;
    await user.save();
    
    // Update rental
    rental.paymentStatus = 'completed';
    rental.paymentId = paymentId;
    rental.unlocked = true;
    rental.totalAmount = currentCost;
    await rental.save();
    
    // Record transaction
    await new Transaction({
      user: user._id,
      type: 'rental',
      amount: -currentCost,
      description: `Rental payment for ${rental.umbrella.umbrellaId} via ${paymentMethod || 'Card'}`
    }).save();

    res.json({ 
      message: 'Payment successful, umbrella unlocked', 
      rental,
      walletBalance: user.walletBalance,
      amountDeducted: currentCost
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pay for all active rentals
router.post('/pay-all', auth, async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;
    
    const activeRentals = await Rental.find({ 
      user: req.user._id, 
      isActive: true,
      unlocked: false
    }).populate('umbrella');
    
    if (activeRentals.length === 0) {
      return res.status(404).json({ message: 'No unpaid rentals found' });
    }
    
    // Calculate total cost for all rentals
    let totalCost = 0;
    const rentalCosts = [];
    
    activeRentals.forEach(rental => {
      const hours = Math.ceil((new Date() - rental.startTime) / (1000 * 60 * 60));
      const cost = hours <= 7 ? (hours || 1) * 7 : Math.ceil(hours / 24) * 70;
      totalCost += cost;
      rentalCosts.push({ rental, cost });
    });
    
    // Check wallet balance
    const user = await User.findById(req.user._id);
    if (user.walletBalance < totalCost) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }
    
    // Deduct from wallet
    user.walletBalance -= totalCost;
    await user.save();
    
    // Update all rentals
    const updatedRentals = [];
    for (const { rental, cost } of rentalCosts) {
      rental.paymentStatus = 'completed';
      rental.paymentId = paymentId;
      rental.unlocked = true;
      rental.totalAmount = cost;
      await rental.save();
      updatedRentals.push(rental);
      
      // Record individual transactions
      await new Transaction({
        user: user._id,
        type: 'rental',
        amount: -cost,
        description: `Rental payment for ${rental.umbrella.umbrellaId} via ${paymentMethod || 'Card'}`
      }).save();
    }

    res.json({ 
      message: `Payment successful, ${activeRentals.length} umbrellas unlocked`, 
      rentals: updatedRentals,
      walletBalance: user.walletBalance,
      amountDeducted: totalCost,
      count: activeRentals.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// End rental
router.post('/:id/end', auth, async (req, res) => {
  try {
    const { dropOffLocation } = req.body;
    const rental = await Rental.findById(req.params.id).populate('umbrella user');
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    rental.endTime = new Date();
    const hours = Math.ceil((rental.endTime - rental.startTime) / (1000 * 60 * 60));
    rental.duration = hours;
    rental.totalAmount = hours <= 7 ? hours * 7 : Math.ceil(hours / 24) * 70;
    rental.isActive = false;
    
    if (dropOffLocation) {
      rental.dropOffLocation = dropOffLocation;
    }
    
    await rental.save();

    // Update umbrella location and availability
    const umbrella = await Umbrella.findById(rental.umbrella._id);
    if (dropOffLocation) {
      umbrella.location = {
        address: dropOffLocation.address,
        latitude: dropOffLocation.latitude,
        longitude: dropOffLocation.longitude
      };
    }
    umbrella.isAvailable = true;
    umbrella.currentRental = null;
    await umbrella.save();

    // Update user rental history (wallet already deducted during payment)
    const user = await User.findById(rental.user._id);
    user.rentalHistory.push(rental._id);
    await user.save();

    res.json({ rental, invoice: {
      umbrellaId: rental.umbrella.umbrellaId,
      duration: rental.duration,
      amount: rental.totalAmount,
      date: rental.endTime,
      dropOffLocation: rental.dropOffLocation
    }});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active rentals
router.get('/active', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ 
      user: req.user._id, 
      isActive: true 
    }).populate('umbrella');
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rental history
router.get('/history', auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user._id })
      .populate('umbrella')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;