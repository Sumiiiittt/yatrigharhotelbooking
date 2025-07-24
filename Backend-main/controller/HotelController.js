// controller/HotelController.js
const Hotel = require('../models/Hotel');

// GET /api/hotels
const findAll = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    // pick the first image in the array as the “cover”
    const withCover = hotels.map(h => ({
      ...h._doc,
      image: h.images && h.images.length
        ? `http://localhost:5000/hotel_images/${h.images[0]}`
        : null
    }));
    res.status(200).json(withCover);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching hotels', details: err.message });
  }
};

// POST /api/hotels
const saveAll = async (req, res) => {
  try {
    const { name, location, description, pricePerNight, rooms } = req.body;
    if (!name || !location || !description || !pricePerNight || !rooms) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const filenames = req.files ? req.files.map(f => f.filename) : [];
    const newHotel = new Hotel({
      name, location, description, pricePerNight, rooms,
      images: filenames
    });
    await newHotel.save();
    res.status(201).json({
      ...newHotel._doc,
      image: filenames.length
        ? `http://localhost:5000/hotel_images/${filenames[0]}`
        : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create hotel', details: err.message });
  }
};

// GET /api/hotels/:id
const findById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/hotels/:id
const update = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Not found' });

    const { name, location, description, pricePerNight, rooms } = req.body;
    const imgs = req.files.length
      ? req.files.map(f => f.filename)
      : hotel.images;

    const updated = await Hotel.findByIdAndUpdate(
      req.params.id,
      { name, location, description, pricePerNight, rooms, images: imgs },
      { new: true }
    );
    res.json({
      ...updated._doc,
      image: updated.images.length
        ? `http://localhost:5000/hotel_images/${updated.images[0]}`
        : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/hotels/:id
const deleteById = async (req, res) => {
  try {
    const deleted = await Hotel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { findAll, saveAll, findById, update, deleteById };
