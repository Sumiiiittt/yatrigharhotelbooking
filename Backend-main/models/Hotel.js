// models/Hotel.js
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name:         { type: String,  required: true },
  images:       [{ type: String, required: true }],
  description:  { type: String,  required: true },
  pricePerNight:{ type: Number,  required: true, min: 0 },
  rooms:        {
    type: String,
    required: true, 
    enum: ['Available','Booked','Under Maintenance'],
    default: 'Available'
  },
  location:     { type: String,  required: true }
});

module.exports = mongoose.model('Hotel', hotelSchema);
