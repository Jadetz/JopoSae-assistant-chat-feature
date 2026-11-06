import "dotenv/config";
import app from "./app.js";
import logger from "./lib/logger.js";

const log = logger.child({ Component: "http" });
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Welcome back Mas jadetz");
  log.info({ port: PORT }, "API server listening");
});
