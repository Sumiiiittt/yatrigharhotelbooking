const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: { type: String, required: true },
  role: { type: String, default: "customer" }, // e.g., "admin", "customer"
  contact_no: {
    type: String,
  },
  profileImage: { type: String }, // URL or filename for profile picture
  address: { type: String },
  isActive: { type: Boolean, default: true},
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String }, // For TOTP or similar
  pendingMfaCode: { type: String }, // For email OTP
  pendingMfaExpiry: { type: Date }, // OTP expiry
});

const Customer = mongoose.model("customers", customerSchema);
module.exports = Customer;
