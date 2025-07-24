const Customer = require("../models/Customer");
const nodemailer = require("nodemailer");
require("dotenv").config(); // For environment variables
const Booking = require("../models/Booking")
const bcrypt = require("bcryptjs");

const findAll = async (req, res) => {
  try {
    // Include 'isActive' in the projection to ensure it is returned
    const customers = await Customer.find({}, "username email _id isActive");
    console.log("Fetched Customers:", customers); // Debugging log
    res.status(200).json(customers);
  } catch (e) {
    console.error("Error fetching customers:", e); // Log errors
    res.status(500).json({ error: "Failed to fetch customers", details: e.message });
  }
};



const saveAll = async (req, res) => {
    try {
      const customer = new Customer(req.body);
  
      // Validate required fields
      if (!req.body.email || !req.body.username) {
        return res.status(400).json({ error: "Email and username are required for registration" });
      }
  
      await customer.save();
  
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
  
      const info = await transporter.sendMail({
        from: "psiddhartha62@gmail.com",
        to: customer.email,
        subject: "Customer Registration",
        html: `
          <h1>Your registration has been completed</h1>
          <p>Your username is <strong>${customer.username}</strong></p>
        `,
      });
  
      res.status(201).json({ customer, emailInfo: info });
    } catch (e) {
      res.status(500).json({ error: "Failed to save customer", details: e.message });
    }
  };

const findById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch customer", details: e.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    // First, delete the bookings associated with the customer
    const deletedBookings = await Booking.deleteMany({ customerId: id });

    if (deletedBookings.deletedCount === 0) {
      console.log("No bookings found for this customer.");
    }

    // Then, delete the customer
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json({ message: "Customer and related bookings deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete customer", details: e.message });
  }
};
const update = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = req.body;
    // If a new profile image is uploaded, save its filename
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }
    const customer = await Customer.findByIdAndUpdate(id, updateData, { new: true });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (e) {
    res.status(500).json({ error: "Failed to update customer", details: e.message });
  }
};
// Get active status of a user by ID
const getActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the customer by ID
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Send the active status of the user
    res.status(200).json({ isActive: customer.isActive });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch active status", details: e.message });
  }
};

// Update active status of a user by ID
const updateActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body; // This should be true or false

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }

    // Find the customer and update the active status
    const customer = await Customer.findByIdAndUpdate(id, { isActive }, { new: true });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json({ message: "Active status updated successfully", isActive: customer.isActive });
  } catch (err) {
    res.status(500).json({ error: "Failed to update active status", details: err.message });
  }
};

// Password strength checker
function isStrongPassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(403).json({ error: "Current password is incorrect" });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." });
    }
    // Prevent password reuse
    const isSame = await bcrypt.compare(newPassword, customer.password);
    if (isSame) {
      return res.status(400).json({ error: "New password must be different from the current password." });
    }
    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (e) {
    res.status(500).json({ error: "Failed to change password", details: e.message });
  }
};


module.exports = {
  findAll,
  saveAll,
  findById,
  deleteById,
  update,
  getActiveStatus,
  updateActiveStatus,
  changePassword,
};
