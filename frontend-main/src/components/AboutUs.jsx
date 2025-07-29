// AboutUs.jsx
import React from 'react';
import './AboutUs.css';
import Laptop from "../assets/Laptop.jpg";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <section className="offer-section" id="about">
        <h2 className="offer-title">What We Are</h2>
      </section>

      <section className="about-section">
        <div className="about-image">
          <img
            src={Laptop}
            alt="Team working on laptops"
            className="responsive-image"
          />
        </div>
        <div className="about-text">
          <h3>Welcome to YatriGhar</h3>
          <p>
            At YatriGhar, we believe every journey through Nepal is more than just 
            a trip—it’s a living story waiting to unfold. Born from a passion for
            exploration and love for our homeland’s rich tapestry of culture,
            landscapes, and traditions, we bring you hand-crafted travel experiences
            that leave memories to last a lifetime.
          </p>
          <h3>Our Story</h3>
          <p>
            YatriGhar started when a group of avid Nepali travelers and storytellers
            came together with a shared dream: to showcase Nepal’s hidden gems
            beyond the well-trodden trails. From the whispering pines of the
            Annapurna foothills to the vibrant festivals of Kathmandu, our founders
            have walked, biked, and trekked every corner—so you can discover Nepal’s
            soul with confidence and curiosity.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
