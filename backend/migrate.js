// Runs pending SQL migrations in backend/migrations/.
// Usage: npm run migrate
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

function buildConnectionOptions({ includeDatabase = true } = {}) {
  const options = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    multipleStatements: true,
  };

  if (includeDatabase) {
    options.database = process.env.DB_NAME || "car_rental";
  }

  const caPath = path.join(__dirname, "ca.pem");
  if (fs.existsSync(caPath)) {
    options.ssl = { ca: fs.readFileSync(caPath) };
  }

  return options;
}

async function ensureDatabase(conn) {
  const dbName = process.env.DB_NAME || "car_rental";
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${dbName}\``);
}

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function listMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

async function getAppliedMigrations(conn) {
  const [rows] = await conn.query("SELECT name FROM schema_migrations ORDER BY name");
  return new Set(rows.map((r) => r.name));
}

export async function runMigrations() {
  // Connect without a DB first so we can create it on local MySQL.
  // On managed hosts (e.g. Aiven) CREATE DATABASE may fail — we still try USE.
  const bootstrap = await mysql.createConnection(buildConnectionOptions({ includeDatabase: false }));

  try {
    await ensureDatabase(bootstrap);
  } catch (err) {
    console.warn(`Could not create database (continuing): ${err.message}`);
    const dbName = process.env.DB_NAME || "car_rental";
    await bootstrap.query(`USE \`${dbName}\``);
  }

  await ensureMigrationsTable(bootstrap);

  const applied = await getAppliedMigrations(bootstrap);
  const files = listMigrationFiles();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("No pending migrations.");
    await bootstrap.end();
    return;
  }

  console.log(`Running ${pending.length} migration(s)…`);

  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`  → ${file}`);
    await bootstrap.query(sql);
    await bootstrap.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
  }

  console.log("✅  Migrations complete.");
  await bootstrap.end();
}

// Run when executed directly: `node migrate.js` / `npm run migrate`
const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
  runMigrations().catch((err) => {
    console.error("Migrate failed:", err.message);
    process.exit(1);
  });
}
