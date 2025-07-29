const express = require("express");
const { findAll, saveAll, findByCustomerId } = require("../controller/BookingController");
const router = express.Router();

// Get all bookings
router.get("/", findAll);

// Get bookings by user id
router.get("/:customerId", findByCustomerId);

// Create new booking
router.post("/", saveAll);

module.exports = router;