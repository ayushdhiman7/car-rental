// Express REST API for the car rental website.
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check.
app.get("/api/health", (req, res) => res.json({ ok: true }));

// GET /api/categories -> distinct categories with counts.
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT category, COUNT(*) AS count FROM cars GROUP BY category ORDER BY category"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cars?category=&search=&sort=&maxPrice=
app.get("/api/cars", async (req, res) => {
  try {
    const { category, search, sort, maxPrice } = req.query;
    const where = [];
    const params = [];

    if (category && category !== "All") {
      where.push("category = ?");
      params.push(category);
    }
    if (search) {
      where.push("(name LIKE ? OR brand LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (maxPrice) {
      where.push("price_per_day <= ?");
      params.push(Number(maxPrice));
    }

    let sql = "SELECT * FROM cars";
    if (where.length) sql += " WHERE " + where.join(" AND ");

    const sorts = {
      "price-asc": " ORDER BY price_per_day ASC",
      "price-desc": " ORDER BY price_per_day DESC",
      "rating": " ORDER BY rating DESC",
      "name": " ORDER BY name ASC",
    };
    sql += sorts[sort] || " ORDER BY id ASC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cars/:id -> single car.
app.get("/api/cars/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cars WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Car not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings -> create a booking (price recomputed server-side).
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      car_id, customer_name, email, phone,
      pickup_location, start_date, end_date,
    } = req.body;

    if (!car_id || !customer_name || !email || !phone || !pickup_location || !start_date || !end_date) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid dates." });
    }
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      return res.status(400).json({ error: "End date must be after the start date." });
    }

    const [cars] = await pool.query("SELECT * FROM cars WHERE id = ?", [car_id]);
    if (!cars.length) return res.status(404).json({ error: "Car not found" });

    // Never trust a client-supplied total — always recompute from the DB price.
    const total_price = (Number(cars[0].price_per_day) * days).toFixed(2);

    const [result] = await pool.query(
      `INSERT INTO bookings
        (car_id, customer_name, email, phone, pickup_location, start_date, end_date, days, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [car_id, customer_name, email, phone, pickup_location, start_date, end_date, days, total_price]
    );

    res.status(201).json({
      id: result.insertId,
      car: cars[0],
      days,
      total_price,
      message: "Booking confirmed!",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings?email= -> bookings, optionally filtered by customer email.
app.get("/api/bookings", async (req, res) => {
  try {
    const { email } = req.query;
    let sql = `
      SELECT b.*, c.name AS car_name, c.brand AS car_brand, c.image_url AS car_image
      FROM bookings b JOIN cars c ON c.id = b.car_id`;
    const params = [];
    if (email) {
      sql += " WHERE b.email = ?";
      params.push(email);
    }
    sql += " ORDER BY b.created_at DESC";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚗  API running on http://localhost:${PORT}`));
