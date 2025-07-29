// routes/contactRoute.js
const express = require("express");
const router = express.Router();
const { submitContactForm,getContactRequests,deleteContactRequest } = require("../controller/ContactRequestController");

// Route to handle form submission
router.post("/submit", submitContactForm);
router.get("/getAll", getContactRequests);
router.delete("/delete/:id", deleteContactRequest);

module.exports = router;