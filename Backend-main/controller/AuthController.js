const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "8261ba19898d0dcdfe6c0c411df74b587b2e54538f5f451633b71e39f957cf01";
const Customer = require("../models/Customer");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Helper: Send OTP email
async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your YatriGhar Login OTP",
    html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>This code will expire in 10 minutes.</p>`
  });
}

// Registration Endpoint
const register = async (req, res) => {
  try {
    const { username, email, password, role, contact_no } = req.body;

    // Normalize email to lowercase
    const emailLower = email.toLowerCase();

    // Check if email already exists
    const existingUser = await Customer.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save customer in the database
    const customer = new Customer({
      username,
      email: emailLower,
      password: hashedPassword,
      role,
      contact_no, // Optional: Save contact number if provided
    });
    await customer.save();

    // Return the user details including ID
    res.status(201).json({
      message: 'Registration successful',
      user: {
        _id: customer._id,
        username: customer.username,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Error in register:', error.stack || error);
    res.status(500).json({ error: 'Something went wrong during registration', details: error.message });
  }
};


// Login Endpoint
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
const MFA_OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();
    const customer = await Customer.findOne({ email: emailLower });
    if (!customer) {
      return res.status(403).json({ error: "Invalid email or password" });
    }
    // Check for lockout
    if (customer.lockUntil && customer.lockUntil > Date.now()) {
      return res.status(403).json({ error: `Account locked. Try again after ${new Date(customer.lockUntil).toLocaleTimeString()}` });
    }
    // Check if account is active
    if (!customer.isActive) {
      return res.status(403).json({ error: "Your account is inactive. Please contact admin to activate." });
    }
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      customer.loginAttempts = (customer.loginAttempts || 0) + 1;
      // Lock account if too many failed attempts
      if (customer.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        customer.lockUntil = Date.now() + LOCK_TIME;
        await customer.save();
        return res.status(403).json({ error: `Account locked due to too many failed attempts. Try again after ${new Date(customer.lockUntil).toLocaleTimeString()}` });
      }
      await customer.save();
      return res.status(403).json({ error: "Invalid email or password" });
    }
    // Reset login attempts on successful password
    customer.loginAttempts = 0;
    customer.lockUntil = undefined;
    // If MFA is enabled, generate and send OTP
    if (customer.mfaEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      customer.pendingMfaCode = otp;
      customer.pendingMfaExpiry = new Date(Date.now() + MFA_OTP_EXPIRY);
      await customer.save();
      await sendOtpEmail(customer.email, otp);
      return res.status(200).json({ mfaRequired: true, message: "OTP sent to your email." });
    }
    // No MFA: issue JWT
    const token = jwt.sign(
      { email: customer.email, role: customer.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    await customer.save();
    res.status(200).json({
      message: "Login successful",
      token,
      customerId: customer._id,
      email: customer.email,
      username: customer.username,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Something went wrong during login" });
  }
};

// OTP Verification Endpoint
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const emailLower = email.toLowerCase();
    const customer = await Customer.findOne({ email: emailLower });
    if (!customer || !customer.mfaEnabled) {
      return res.status(400).json({ error: "MFA not enabled or user not found." });
    }
    if (!customer.pendingMfaCode || !customer.pendingMfaExpiry || customer.pendingMfaExpiry < Date.now()) {
      return res.status(400).json({ error: "OTP expired. Please login again." });
    }
    if (customer.pendingMfaCode !== otp) {
      return res.status(403).json({ error: "Invalid OTP." });
    }
    // OTP valid: clear fields and issue JWT
    customer.pendingMfaCode = undefined;
    customer.pendingMfaExpiry = undefined;
    await customer.save();
    const token = jwt.sign(
      { email: customer.email, role: customer.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful",
      token,
      customerId: customer._id,
      email: customer.email,
      username: customer.username,
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({ error: "Something went wrong during OTP verification" });
  }
};

// Enable MFA Endpoint
const enableMfa = async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.toLowerCase();
    const customer = await Customer.findOne({ email: emailLower });
    if (!customer) {
      return res.status(404).json({ error: "User not found" });
    }
    if (customer.mfaEnabled) {
      return res.status(400).json({ error: "MFA is already enabled." });
    }
    // Generate OTP for enabling MFA
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    customer.pendingMfaCode = otp;
    customer.pendingMfaExpiry = new Date(Date.now() + MFA_OTP_EXPIRY);
    await customer.save();
    await sendOtpEmail(customer.email, otp);
    res.status(200).json({ message: "OTP sent to your email. Please verify to enable MFA." });
  } catch (error) {
    console.error("Error in enableMfa:", error);
    res.status(500).json({ error: "Something went wrong during MFA enablement" });
  }
};

// Disable MFA Endpoint
const disableMfa = async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.toLowerCase();
    const customer = await Customer.findOne({ email: emailLower });
    if (!customer) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!customer.mfaEnabled) {
      return res.status(400).json({ error: "MFA is not enabled." });
    }
    // Generate OTP for disabling MFA
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    customer.pendingMfaCode = otp;
    customer.pendingMfaExpiry = new Date(Date.now() + MFA_OTP_EXPIRY);
    await customer.save();
    await sendOtpEmail(customer.email, otp);
    res.status(200).json({ message: "OTP sent to your email. Please verify to disable MFA." });
  } catch (error) {
    console.error("Error in disableMfa:", error);
    res.status(500).json({ error: "Something went wrong during MFA disablement" });
  }
};


module.exports = {
  register,
  login,
  verifyOtp,
  enableMfa,
  disableMfa,
};
