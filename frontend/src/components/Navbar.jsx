import { NavLink, Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/cars", label: "Fleet" },
    { to: "/bookings", label: "My Bookings" },
  ];

  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">◆</span>
          <span className="brand-text">VELOCE</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/cars" className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
            Book Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
