import React from "react";
import "./Global.css"; // Ensure the CSS file is linked

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>About Us</h4>
          <p>
            We are dedicated to providing the best online shopping experience
            with top-quality products and unbeatable prices.
          </p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/categories">Categories</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul>
            <li>Email: support@yourecommerce.com</li>
            <li>Phone: +1 234 567 890</li>
            <li>Address: 123 E-commerce St, Shop City</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <ul className="social-links">
            <li>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/rohitsharma45/?hl=en" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <button className="back-to-top" onClick={scrollToTop}>
            Back to Top
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Your E-commerce Website. All rights reserved.</p>
        <p>
          Need help? Contact our{" "}
          <a href="/support" className="support-link">
            Customer Support
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

export default Footer;