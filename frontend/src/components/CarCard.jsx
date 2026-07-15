import { Link } from "react-router-dom";

export default function CarCard({ car }) {
  return (
    <Link to={`/cars/${car.id}`} className="car-card">
      <div className="car-card-media">
        <img src={car.image_url} alt={`${car.brand} ${car.name}`} loading="lazy" />
        <span className="car-badge">{car.category}</span>
        <span className="car-rating">★ {Number(car.rating).toFixed(1)}</span>
      </div>
      <div className="car-card-body">
        <div className="car-card-head">
          <div>
            <p className="car-brand">{car.brand}</p>
            <h3 className="car-name">{car.name}</h3>
          </div>
          <div className="car-price">
            <strong>${Number(car.price_per_day).toFixed(0)}</strong>
            <span>/day</span>
          </div>
        </div>
        <ul className="car-specs">
          <li>🪑 {car.seats} seats</li>
          <li>⚙️ {car.transmission}</li>
          <li>⛽ {car.fuel}</li>
        </ul>
        <span className="car-cta">View details →</span>
      </div>
    </Link>
  );
}
