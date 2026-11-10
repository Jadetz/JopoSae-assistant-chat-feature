import PG from "pg";
import logger from "./lib/logger.js";
import ERROR_CODES from "./lib/errorCodes.js";

const { Pool } = PG;
const log = logger.child({ component: "db" });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
});

pool.on("error", (error) => {
  log.error(
    { err: error, code: ERROR_CODES.DB_POOL_ERROR },
    "Unexpected PostgreSQL pool error",
  );
});
// Run work(client) on one connection between BEGIN and COMMIT.
// If work throws, everything it wrote is rolled back and the error goes to the caller.
const withTransaction = async (work) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
export { withTransaction };
