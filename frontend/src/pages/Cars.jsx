import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import CarCard from "../components/CarCard.jsx";

const CATEGORIES = ["All", "Economy", "SUV", "Luxury", "Sports", "Electric", "Van"];

export default function Cars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "All";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";

  // Keep a local input value so typing feels instant.
  const [searchInput, setSearchInput] = useState(search);

  const update = (patch) => {
    const next = { category, search, sort, ...patch };
    const clean = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v && v !== "All")
    );
    setSearchParams(clean);
  };

  useEffect(() => {
    setLoading(true);
    api
      .getCars({ category, search, sort })
      .then(setCars)
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  return (
    <section className="section container">
      <div className="page-head">
        <h1>Our Fleet</h1>
        <p>{loading ? "Loading…" : `${cars.length} vehicles available`}</p>
      </div>

      <div className="toolbar">
        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: searchInput });
          }}
        >
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by brand or model…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
          <option value="">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top rated</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className="chips">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? "chip-active" : ""}`}
            onClick={() => update({ category: c })}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="car-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="car-card skeleton" key={i} />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="empty">
          <p>🚧 No cars match your filters.</p>
          <button className="btn btn-primary" onClick={() => setSearchParams({})}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="car-grid">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </section>
  );
}
