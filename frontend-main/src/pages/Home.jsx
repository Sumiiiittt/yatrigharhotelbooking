
import hom from "../assets/new_img.jpg";
import './Home.css';

import Service from "../components/Service";
import AboutUs from "../components/AboutUs";
import Quote from "../components/Quote";

import HotelList from "../components/HotelList";
import ContactForm from "../contact/ContactForm";


const Home = () => {
  return (
    <>
      {/* Image Section */}
      <div className="image-container">
        <img src={hom} alt="Welcome to the site" />
        <div className="search-bar-container">
          <h2>YatriGhar: Every step is a story.</h2>
        </div>
      </div>
      <br/>
      <HotelList/>
      <br/> 
      <Service/>
      <br/>
      <Quote/>
      <br/>
      <AboutUs/>
      <br/>
      <div id="get-in-touch">
        <ContactForm/>
      </div>

      


      

    
    </>
  );
};

export default Home;
