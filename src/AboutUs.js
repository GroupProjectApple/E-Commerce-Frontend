import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-header">
        <h1>About Us</h1>
        <p>Your trusted e-commerce platform</p>
      </div>
      <div className="about-us-content">
        <section className="about-us-description">
          <h2>Our Story</h2>
          <p>
            Welcome to [Your Company Name], your number one source for all things [products you sell]. We're dedicated to giving you the very best of [product categories], with a focus on quality, customer service, and uniqueness.
          </p>
          <p>
            Founded in [Year], [Your Company Name] has come a long way from its beginnings in [starting location]. When we first started out, our passion for [specific reason for starting the business] drove us to do intense research, so that [Your Company Name] can offer you the world’s most advanced products. We now serve customers all over [region or country], and are thrilled to be a part of the e-commerce industry.
          </p>
        </section>
        <section className="about-us-mission">
          <h2>Our Mission</h2>
          <p>
            Our mission is to provide our customers with high-quality products at affordable prices, while ensuring a seamless shopping experience. We are committed to building long-lasting relationships with our customers and supporting them every step of the way.
          </p>
        </section>
        <section className="about-us-contact">
          <h2>Contact Us</h2>
          <p>If you have any questions or concerns, feel free to reach out to us:</p>
          <ul>
            <li>Email: support@yourcompany.com</li>
            <li>Phone: +1 234 567 890</li>
            <li>Address: 123 E-Commerce Street, City, Country</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;