import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customer_name: "", email: "", phone: "", pickup_location: "",
    start_date: todayISO(1), end_date: todayISO(3),
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    setCar(null);
    api.getCar(id).then(setCar).catch((e) => setError(e.message));
    window.scrollTo(0, 0);
  }, [id]);

  // Live price estimate mirrors the server's day-count logic.
  const estimate = useMemo(() => {
    if (!car) return null;
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (!days || days <= 0) return null;
    return { days, total: (Number(car.price_per_day) * days).toFixed(2) };
  }, [car, form.start_date, form.end_date]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.createBooking({ car_id: car.id, ...form });
      setConfirmation(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !car) {
    return (
      <div className="section container empty">
        <p>{error}</p>
        <Link to="/cars" className="btn btn-primary">Back to fleet</Link>
      </div>
    );
  }

  if (!car) {
    return <div className="section container"><div className="detail-skeleton" /></div>;
  }

  return (
    <section className="section container">
      <Link to="/cars" className="link-arrow back">← Back to fleet</Link>

      <div className="detail">
        <div className="detail-media">
          <img src={car.image_url} alt={`${car.brand} ${car.name}`} />
          <span className="car-badge">{car.category}</span>
        </div>

        <div className="detail-info">
          <p className="car-brand">{car.brand}</p>
          <h1>{car.name}</h1>
          <div className="detail-rating">★ {Number(car.rating).toFixed(1)} · {car.category}</div>
          <p className="detail-desc">{car.description}</p>

          <div className="detail-specs">
            <div><span>Seats</span><strong>{car.seats}</strong></div>
            <div><span>Transmission</span><strong>{car.transmission}</strong></div>
            <div><span>Fuel</span><strong>{car.fuel}</strong></div>
            <div><span>Per day</span><strong>${Number(car.price_per_day).toFixed(0)}</strong></div>
          </div>
        </div>
      </div>

      {/* BOOKING */}
      <div className="booking" id="book">
        <h2>Reserve this car</h2>
        <form className="booking-form" onSubmit={submit}>
          <div className="field">
            <label>Full name</label>
            <input required value={form.customer_name} onChange={set("customer_name")} placeholder="Jane Driver" />
          </div>
          <div className="field">
            <label>Email</label>
            <input required type="email" value={form.email} onChange={set("email")} placeholder="jane@email.com" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input required value={form.phone} onChange={set("phone")} placeholder="+1 555 010 0199" />
          </div>
          <div className="field">
            <label>Pickup location</label>
            <input required value={form.pickup_location} onChange={set("pickup_location")} placeholder="Downtown Depot" />
          </div>
          <div className="field">
            <label>Pickup date</label>
            <input required type="date" min={todayISO()} value={form.start_date} onChange={set("start_date")} />
          </div>
          <div className="field">
            <label>Return date</label>
            <input required type="date" min={form.start_date} value={form.end_date} onChange={set("end_date")} />
          </div>

          <div className="booking-summary">
            {estimate ? (
              <div>
                <span>${Number(car.price_per_day).toFixed(0)} × {estimate.days} day{estimate.days > 1 ? "s" : ""}</span>
                <strong>${estimate.total}</strong>
              </div>
            ) : (
              <span className="muted">Choose valid dates to see the total.</span>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary btn-lg" disabled={submitting || !estimate}>
            {submitting ? "Confirming…" : "Confirm booking"}
          </button>
        </form>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmation && (
        <div className="modal-overlay" onClick={() => setConfirmation(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-check">✓</div>
            <h2>Booking confirmed!</h2>
            <p>
              Your <strong>{confirmation.car.brand} {confirmation.car.name}</strong> is
              reserved for <strong>{confirmation.days} day{confirmation.days > 1 ? "s" : ""}</strong>.
            </p>
            <div className="modal-total">
              <span>Total</span>
              <strong>${confirmation.total_price}</strong>
            </div>
            <p className="muted">Booking #{confirmation.id} · A confirmation was sent to {form.email}</p>
            <div className="modal-actions">
              <Link to="/bookings" className="btn btn-primary">View my bookings</Link>
              <button className="btn btn-ghost" onClick={() => setConfirmation(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
