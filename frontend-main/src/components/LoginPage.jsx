import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import './LoginPage.css';
import { useAuth } from '../context/AuthContext'; // Import the custom hook to use AuthContext

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from AuthContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      if (email === 'admin@gmail.com' && password === 'admin@123') {
        // Admin login process
        toast.success('Admin login successful!', { position: 'top-center', autoClose: 3000 });
        const adminData = { email, token: 'admin-token', name: 'Admin' };
        login(adminData); // Call login from context with admin data
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }
  
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (response.ok && data.mfaRequired) {
        setOtpStep(true);
        setPendingEmail(email);
        setPendingPassword(password);
        toast.info('OTP sent to your email. Please enter it below.', { position: 'top-center', autoClose: 5000 });
        return;
      }
      if (response.ok) {
        // Extract necessary data from the response
        const { email, token, customerId, username } = data;
  
        // Store token, customerId, and user data in context
        login({ email, token, customerId, username });
  
        // Persist customerId and token in localStorage
        localStorage.setItem('customerId', customerId);
        localStorage.setItem('token', token);
  
        toast.success('Login successful!', { position: 'top-center', autoClose: 3000 });
        setTimeout(() => navigate('/'), 3000);
      } else {
        toast.error(data.error || 'Invalid email or password', { position: 'top-center', autoClose: 3000 });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again later.', { position: 'top-center', autoClose: 3000 });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        const { email, token, customerId, username } = data;
        login({ email, token, customerId, username });
        localStorage.setItem('customerId', customerId);
        localStorage.setItem('token', token);
        toast.success('Login successful!', { position: 'top-center', autoClose: 3000 });
        setTimeout(() => navigate('/'), 3000);
      } else {
        toast.error(data.error || 'Invalid OTP', { position: 'top-center', autoClose: 3000 });
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.', { position: 'top-center', autoClose: 3000 });
    }
  };
  
  

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={otpStep ? handleOtpSubmit : handleLogin}>
        <div className="head">
          <h2>Login</h2>
        </div>

        <div className="welcome-back">
          <p>Welcome Back! Please login to continue.</p>
        </div>

        {!otpStep && (
          <>
            <div className="input-container">
              <div className="form-floating">
                <input
                  type="email"
                  className="form-control"
                  id="floatingEmail"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="floatingEmail">Email</label>
              </div>
            </div>

            <div className="input-container">
              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  id="floatingPassword"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="floatingPassword">Password</label>
              </div>
            </div>

            <div className="forget-container">
              <p className="forget">Forgot Password?</p>
            </div>
          </>
        )}
        {otpStep && (
          <div className="input-container">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="floatingOtp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                inputMode="numeric"
              />
              <label htmlFor="floatingOtp">Enter OTP</label>
            </div>
          </div>
        )}

        <button className="btn btn-primary login-btn" type="submit">
          {otpStep ? 'Verify OTP' : 'Login'}
        </button>

        <div className="signup-link">
          <p>
            Don't have an account?{' '}
            <a href="/signup" className="signup-link-text">Signup</a>
          </p>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
};

export default LoginPage;