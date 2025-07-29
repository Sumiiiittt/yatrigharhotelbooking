// Footer.jsx
import './Footer.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-inner container">
        {/* About */}
        <div className="footer-col">
          <h4>About YatriGhar</h4>
          <p>
            YatriGhar is your passport to Nepal’s hidden gems. We craft authentic journeys—
            from the hills of Annapurna to the festivals of Kathmandu.
          </p>
          <small>© 2025 YatriGhar. All rights reserved.</small>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h5>Quick Links</h5>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/hotels">Hotels & Packages</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/faq">FAQs</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h5>Contact Us</h5>
          <address>
            Thamel, Kathmandu, Nepal<br/>
            <a href="tel:+97712345678">+977-9876984748</a><br/>
            <a href="mailto:info@yatrighar.com">sumit@yatrighar.com</a>
          </address>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
