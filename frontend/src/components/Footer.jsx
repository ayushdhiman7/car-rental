import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-mark">◆</span>
          <span className="brand-text">VELOCE</span>
          <p>Premium cars, effortless rentals. Drive something you'll remember.</p>
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/cars">Full Fleet</Link>
          <Link to="/cars">Categories</Link>
          <Link to="/bookings">My Bookings</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <a href="#!">About us</a>
          <a href="#!">Careers</a>
          <a href="#!">Contact</a>
        </div>
        <div className="footer-col">
          <h4>Get in touch</h4>
          <a href="#!">hello@veloce.rent</a>
          <a href="#!">+1 (800) 555-0199</a>
          <a href="#!">123 Motorway Ave</a>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} Veloce Rentals. All rights reserved.</span>
        <span>Built with React · Express · MySQL</span>
      </div>
    </footer>
  );
}
