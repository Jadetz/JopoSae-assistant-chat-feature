import PG from "pg";

const { Pool } = PG;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
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
