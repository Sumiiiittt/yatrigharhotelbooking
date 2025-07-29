// routes/hotelRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  findAll,
  saveAll,
  findById,
  update,
  deleteById
} = require('../controller/HotelController');

const router = express.Router();

// Multer setup for up to 5 images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'hotel_images'),
  filename:  (req, file, cb) => {
    const ts = Date.now();
    cb(null, `${ts}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only images allowed'), ok);
  }
});

router.get('/',      findAll);
router.post('/',     upload.array('images', 5), saveAll);
router.get('/:id',   findById);
router.put('/:id',   upload.array('images', 5), update);
router.delete('/:id', deleteById);

module.exports = router;
