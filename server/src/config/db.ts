import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      // If you're connecting to hosted PG that requires SSL, set this:
      // ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    });

// Helpful: log unexpected idle client errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});
