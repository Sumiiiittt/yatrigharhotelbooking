
import "./Quote.css"; // Link to the CSS file
import plane from "../assets/plane.png"; // Import your local image
import beach from "../assets/beach.png"; // Import any additional images
import camera from "../assets/camera.png"; // Import any additional images

const features = [
  {
    title: "Book & relax",
    description: "Let each trip be an inspirational journey, each room a peaceful space.",
    image: plane, // Add your correct image path
  },
  {
    title: "Smart checklist",
    description: "Let each trip be an inspirational journey, each room a peaceful space.",
    image: beach, // Add your correct image path
  },
  {
    title: "Save more",
    description: "Let each trip be an inspirational journey, each room a peaceful space.",
    image: camera, // Add your correct image path
  },
];

const Quote = () => {
  return (
    <div>
      <div className="features-container">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <img src={feature.image} alt={feature.title} className="feature-image" />
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>

      <section className="cta-section">
        <h2>Ready to Embark on Your Next Adventure?</h2>
        <p>Discover breathtaking destinations and unforgettable experiences with YatriGhar.</p>
      </section>
    </div>
  );
};

export default Quote;
