import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import CarCard from "../components/CarCard.jsx";

const CATEGORY_ICONS = {
  Economy: "🚗", SUV: "🚙", Luxury: "✨", Sports: "🏎️", Electric: "⚡", Van: "🚐",
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCars({ sort: "rating" }).then((cars) => setFeatured(cars.slice(0, 6)));
    api.getCategories().then(setCategories);
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">◆ Premium car rental</span>
            <h1>
              Drive the <span className="grad">extraordinary</span>.
            </h1>
            <p>
              From city runabouts to weekend supercars — book the perfect ride in
              under a minute. No hidden fees, no queues, just keys.
            </p>
            <div className="hero-actions">
              <Link to="/cars" className="btn btn-primary btn-lg">Browse the fleet</Link>
              <Link to="/bookings" className="btn btn-ghost btn-lg">My bookings</Link>
            </div>
            <div className="hero-stats">
              <div><strong>12+</strong><span>Vehicles</span></div>
              <div><strong>6</strong><span>Categories</span></div>
              <div><strong>4.8★</strong><span>Avg rating</span></div>
            </div>
          </div>
          <div className="hero-art">
            <img
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80"
              alt="Featured sports car"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section container">
        <div className="section-head">
          <h2>Browse by category</h2>
          <Link to="/cars" className="link-arrow">See all →</Link>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <button
              key={c.category}
              className="category-tile"
              onClick={() => navigate(`/cars?category=${encodeURIComponent(c.category)}`)}
            >
              <span className="category-icon">{CATEGORY_ICONS[c.category] || "🚗"}</span>
              <span className="category-name">{c.category}</span>
              <span className="category-count">{c.count} cars</span>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="section container">
        <div className="section-head">
          <h2>Top rated rides</h2>
          <Link to="/cars" className="link-arrow">View fleet →</Link>
        </div>
        <div className="car-grid">
          {featured.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section container">
        <div className="section-head"><h2>How it works</h2></div>
        <div className="steps">
          {[
            ["01", "Pick your car", "Filter by category, price or brand to find your match."],
            ["02", "Choose your dates", "Select pickup and return — we price it instantly."],
            ["03", "Hit the road", "Confirm your booking and grab the keys. That's it."],
          ].map(([n, t, d]) => (
            <div className="step" key={n}>
              <span className="step-num">{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
