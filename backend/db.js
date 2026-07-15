// Central MySQL connection pool used by the whole backend.
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getSslConfig() {
  // Prefer CA from env (Render / cloud) — paste the full PEM including headers.
  if (process.env.DB_CA) {
    return { ca: process.env.DB_CA.replace(/\\n/g, "\n") };
  }

  const caPath = path.join(__dirname, "ca.pem");
  if (fs.existsSync(caPath)) {
    return { ca: fs.readFileSync(caPath) };
  }

  // Optional: enable SSL without a custom CA (less secure; use only if needed).
  if (process.env.DB_SSL === "true") {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

const ssl = getSslConfig();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "car_rental",
  ...(ssl ? { ssl } : {}),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});
