// Runs migrations, then loads sample cars.
// Usage: npm run seed
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { runMigrations } from "./migrate.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const cars = [
  {
    name: "Corolla Altis", brand: "Toyota", category: "Economy",
    price_per_day: 39, seats: 5, transmission: "Automatic", fuel: "Petrol", rating: 4.6,
    image_url: img("1621007947382-bb3c3994e3fb"),
    description: "Reliable, fuel-sipping sedan that's perfect for city runs and long highway trips alike.",
  },
  {
    name: "Civic Sport", brand: "Honda", category: "Economy",
    price_per_day: 45, seats: 5, transmission: "Automatic", fuel: "Petrol", rating: 4.7,
    image_url: img("1606664515524-ed2f786a0bd6"),
    description: "Sharp handling and a refined cabin make the Civic a favourite everyday commuter.",
  },
  {
    name: "CR-V AWD", brand: "Honda", category: "SUV",
    price_per_day: 62, seats: 5, transmission: "Automatic", fuel: "Petrol", rating: 4.5,
    image_url: img("1568605117036-5fe5e7bab0b7"),
    description: "Spacious all-wheel-drive SUV with generous cargo space for family getaways.",
  },
  {
    name: "Wrangler Rubicon", brand: "Jeep", category: "SUV",
    price_per_day: 78, seats: 5, transmission: "Manual", fuel: "Petrol", rating: 4.8,
    image_url: img("1533473359331-0135ef1b58bf"),
    description: "Go anywhere. The Wrangler eats trails for breakfast and looks great doing it.",
  },
  {
    name: "S-Class 500", brand: "Mercedes-Benz", category: "Luxury",
    price_per_day: 145, seats: 5, transmission: "Automatic", fuel: "Petrol", rating: 4.9,
    image_url: img("1550355291-bbee04a92027"),
    description: "First-class comfort, whisper-quiet ride and every luxury feature you can imagine.",
  },
  {
    name: "7 Series", brand: "BMW", category: "Luxury",
    price_per_day: 138, seats: 5, transmission: "Automatic", fuel: "Petrol", rating: 4.8,
    image_url: img("1523983388277-336a66bf9bcd"),
    description: "Executive saloon blending athletic performance with limousine-grade refinement.",
  },
  {
    name: "911 Carrera", brand: "Porsche", category: "Sports",
    price_per_day: 220, seats: 2, transmission: "Automatic", fuel: "Petrol", rating: 5.0,
    image_url: img("1503376780353-7e6692767b70"),
    description: "The definitive sports car. Timeless design and a soundtrack that never gets old.",
  },
  {
    name: "Mustang GT", brand: "Ford", category: "Sports",
    price_per_day: 130, seats: 4, transmission: "Manual", fuel: "Petrol", rating: 4.7,
    image_url: img("1584345604476-8ec5e12e42dd"),
    description: "American muscle with a thunderous V8 and unmistakable pony-car attitude.",
  },
  {
    name: "Model 3 Long Range", brand: "Tesla", category: "Electric",
    price_per_day: 95, seats: 5, transmission: "Automatic", fuel: "Electric", rating: 4.8,
    image_url: img("1560958089-b8a1929cea89"),
    description: "Instant torque, 500 km of range and the slickest touchscreen tech on the road.",
  },
  {
    name: "Ioniq 5", brand: "Hyundai", category: "Electric",
    price_per_day: 88, seats: 5, transmission: "Automatic", fuel: "Electric", rating: 4.6,
    image_url: img("1633509817627-5b1595a6d8b9"),
    description: "Retro-futuristic EV with ultra-fast charging and a lounge-like flat-floor cabin.",
  },
  {
    name: "Sienna", brand: "Toyota", category: "Van",
    price_per_day: 84, seats: 8, transmission: "Automatic", fuel: "Hybrid", rating: 4.5,
    image_url: img("1519641471654-76ce0107ad1b"),
    description: "Eight-seat hybrid people-mover — the stress-free way to travel with a group.",
  },
  {
    name: "Transit Custom", brand: "Ford", category: "Van",
    price_per_day: 70, seats: 9, transmission: "Manual", fuel: "Diesel", rating: 4.3,
    image_url: img("1542282088-fe8426682b8f"),
    description: "Roomy nine-seater van built for road trips, moving day and everything between.",
  },
];

function buildConnectionOptions() {
  const options = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "car_rental",
    multipleStatements: true,
  };

  const caPath = path.join(__dirname, "ca.pem");
  if (fs.existsSync(caPath)) {
    options.ssl = { ca: fs.readFileSync(caPath) };
  }

  return options;
}

async function run() {
  console.log("Applying migrations…");
  await runMigrations();

  const conn = await mysql.createConnection(buildConnectionOptions());

  const [rows] = await conn.query("SELECT COUNT(*) AS n FROM cars");
  if (rows[0].n > 0) {
    console.log(`Cars table already has ${rows[0].n} rows — clearing and re-seeding.`);
    await conn.query("DELETE FROM bookings");
    await conn.query("DELETE FROM cars");
    await conn.query("ALTER TABLE cars AUTO_INCREMENT = 1");
  }

  console.log(`Inserting ${cars.length} cars…`);
  for (const c of cars) {
    await conn.query(
      `INSERT INTO cars
        (name, brand, category, price_per_day, seats, transmission, fuel, rating, image_url, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.name, c.brand, c.category, c.price_per_day, c.seats, c.transmission,
       c.fuel, c.rating, c.image_url, c.description]
    );
  }

  console.log("✅  Seed complete.");
  await conn.end();
}

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
