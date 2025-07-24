const ContactRequest = require("../models/ContactRequest");

// Submit the contact form
const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Create a new contact request
    const contactRequest = new ContactRequest({
      name,
      email,
      phone,
      message,
    });

    // Save the contact request to the database
    await contactRequest.save();

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
};

// Get all contact requests
const getContactRequests = async (req, res) => {
  try {
    const contactRequests = await ContactRequest.find().sort({ createdAt: -1 }); // Sort by date (most recent first)
    res.status(200).json(contactRequests);
  } catch (error) {
    console.error("Error fetching contact requests:", error);
    res.status(500).json({ error: "Failed to fetch contact requests" });
  }
};

// Delete a contact request by ID
const deleteContactRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the contact request by ID
    const contactRequest = await ContactRequest.findByIdAndDelete(id);

    if (!contactRequest) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    res.status(200).json({ message: "Contact request deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact request:", error);
    res.status(500).json({ error: "Failed to delete contact request" });
  }
};

module.exports = { submitContactForm, getContactRequests, deleteContactRequest };
