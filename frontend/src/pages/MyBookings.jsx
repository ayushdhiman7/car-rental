import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function MyBookings() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.getBookings(email);
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section container">
      <div className="page-head">
        <h1>My Bookings</h1>
        <p>Enter the email you booked with to see your reservations.</p>
      </div>

      <form className="lookup" onSubmit={lookup}>
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Searching…" : "Find bookings"}
        </button>
      </form>

      {bookings && bookings.length === 0 && (
        <div className="empty">
          <p>No bookings found for that email.</p>
          <Link to="/cars" className="btn btn-primary">Browse the fleet</Link>
        </div>
      )}

      {bookings && bookings.length > 0 && (
        <div className="booking-list">
          {bookings.map((b) => (
            <div className="booking-row" key={b.id}>
              <img src={b.car_image} alt={b.car_name} />
              <div className="booking-row-main">
                <p className="car-brand">{b.car_brand}</p>
                <h3>{b.car_name}</h3>
                <p className="muted">
                  {b.start_date} → {b.end_date} · {b.days} day{b.days > 1 ? "s" : ""} · {b.pickup_location}
                </p>
              </div>
              <div className="booking-row-side">
                <span className={`status status-${b.status}`}>{b.status}</span>
                <strong>${Number(b.total_price).toFixed(2)}</strong>
                <span className="muted">#{b.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
