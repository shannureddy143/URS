const mongoose = require('mongoose');

const umbrellaSchema = new mongoose.Schema({
  umbrellaId: { type: String, required: true, unique: true },
  color: { type: String, required: true, enum: ['red', 'blue', 'yellow', 'black', 'green'] },
  isAvailable: { type: Boolean, default: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String }
  },
  currentRental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Umbrella', umbrellaSchema);
