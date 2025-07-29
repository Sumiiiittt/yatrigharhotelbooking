import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import profile from "../assets/user.png";
import { toast } from "react-toastify";
import { useSpring, animated } from "@react-spring/web";
import "./ProfileModal.css"; // CSS for styling
import "react-toastify/dist/ReactToastify.css";
import defaultProfileImage from "../assets/profile.png";

const ProfileModal = ({ showModal, onClose }) => {
  const { user, setUser, customerId: contextCustomerId } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaAction, setMfaAction] = useState(""); // 'enable' or 'disable'
  const [otp, setOtp] = useState("");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [address, setAddress] = useState(user?.address || "");
  const [contactNo, setContactNo] = useState(user?.contact_no || "");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  // Modal animation for smooth fade-in and scale-up
  const modalAnimation = useSpring({
    opacity: showModal ? 1 : 0,
    transform: showModal ? "scale(1)" : "scale(0.9)",
    config: { tension: 200, friction: 20 },
  });

  useEffect(() => {
    if (contextCustomerId) {
      setCustomerId(contextCustomerId);
    } else {
      const storedCustomerId = localStorage.getItem("customerId");
      if (storedCustomerId) {
        setCustomerId(storedCustomerId);
      }
    }
  }, [contextCustomerId]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
      });
      setMfaEnabled(user.mfaEnabled || false);
      setProfileImage(user.profileImage || "");
      setAddress(user.address || "");
      setContactNo(user.contact_no || "");
    }
  }, [user, showModal]);

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(newPassword));
  }, [newPassword]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    if (!customerId) {
      console.error("Customer ID is missing");
      toast.error("Customer ID is missing! Please try again.");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("email", formData.email);
      form.append("address", address);
      form.append("contact_no", contactNo);
      if (profileImage && profileImage.name) {
        form.append("profileImage", profileImage);
      }
      const response = await fetch(
        `http://localhost:5000/api/customers/${customerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: form,
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      const updatedUser = await response.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (setUser) {
        setUser(updatedUser);
      }
      toast.success("Profile updated successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaRequest = async (action) => {
    try {
      const endpoint = action === 'enable' ? '/enable-mfa' : '/disable-mfa';
      const response = await fetch(`http://localhost:5000/api/auth${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMfaStep(true);
        setMfaAction(action);
        toast.info(data.message || 'OTP sent to your email.', { position: 'top-center', autoClose: 5000 });
      } else {
        toast.error(data.error || 'Failed to send OTP.', { position: 'top-center', autoClose: 3000 });
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.', { position: 'top-center', autoClose: 3000 });
    }
  };

  const handleMfaOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setMfaEnabled(mfaAction === 'enable');
        setMfaStep(false);
        setOtp("");
        toast.success(`MFA ${mfaAction === 'enable' ? 'enabled' : 'disabled'} successfully!`, { position: 'top-center', autoClose: 3000 });
      } else {
        toast.error(data.error || 'Invalid OTP', { position: 'top-center', autoClose: 3000 });
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.', { position: 'top-center', autoClose: 3000 });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwordStrength !== "Strong") {
      toast.error("Password is not strong enough.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Password changed successfully!");
        setShowPasswordForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  function checkPasswordStrength(pw) {
    if (pw.length < 8) return "Too short";
    if (!/[A-Z]/.test(pw)) return "Add uppercase letter";
    if (!/[a-z]/.test(pw)) return "Add lowercase letter";
    if (!/\d/.test(pw)) return "Add a number";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) return "Add a special character";
    return "Strong";
  }

  return (
    showModal && (
      <animated.div className="modal-container" style={modalAnimation}>
        <div className="form-container">
          <button className="close-button" onClick={onClose}>
            ✖
          </button>
          <div className="modal-header">
            <img
              src={profileImage && !profileImage.name ? `http://localhost:5000/profile_images/${profileImage}` : profileImage && profileImage.name ? URL.createObjectURL(profileImage) : defaultProfileImage}
              alt="Profile Icon"
              className="profile-icon"
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 8 }}
            />
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: 8 }} />
            <h2>{user.username}</h2>
          </div>
          <div className="modal-body">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="form-control"
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
            />
            <label>Phone Number:</label>
            <input
              type="text"
              name="contact_no"
              value={contactNo}
              onChange={e => setContactNo(e.target.value)}
              className="form-control"
            />
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-primary"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              className="btn btn-secondary"
              style={{ marginLeft: 8 }}
              onClick={() => setShowPasswordForm((v) => !v)}
              type="button"
            >
              {showPasswordForm ? "Cancel Password Change" : "Change Password"}
            </button>
            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} style={{ marginTop: 16, width: "100%" }}>
                <label>Current Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
                <label>New Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
                <small>Password strength: {passwordStrength}</small>
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button className="btn btn-success" type="submit" style={{ marginTop: 8 }} disabled={loading}>
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </form>
            )}
            <div style={{ marginTop: '1rem' }}>
              <label><strong>MFA (Email OTP):</strong></label>
              <div>
                {mfaEnabled ? (
                  <>
                    <span style={{ color: 'green', marginRight: 8 }}>Enabled</span>
                    <button className="btn btn-warning btn-sm" onClick={() => handleMfaRequest('disable')} disabled={mfaStep}>Disable MFA</button>
                  </>
                ) : (
                  <>
                    <span style={{ color: 'red', marginRight: 8 }}>Disabled</span>
                    <button className="btn btn-success btn-sm" onClick={() => handleMfaRequest('enable')} disabled={mfaStep}>Enable MFA</button>
                  </>
                )}
              </div>
              {mfaStep && (
                <form onSubmit={handleMfaOtpSubmit} style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    inputMode="numeric"
                    style={{ width: 120, display: 'inline-block', marginRight: 8 }}
                  />
                  <button className="btn btn-primary btn-sm" type="submit">Verify OTP</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </animated.div>
    )
  );
};

export default ProfileModal;
