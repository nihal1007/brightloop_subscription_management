import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dbDir = path.join(rootDir, ".db");
const binDir = path.join(dbDir, "pgsql", "bin");
const dataDir = path.join(dbDir, "data");
const pgCtl = path.join(binDir, "pg_ctl.exe");

try {
  console.log("Stopping local PostgreSQL server...");
  execSync(`"${pgCtl}" -D "${dataDir}" stop -m fast`, {
    stdio: "inherit",
  });
  console.log("PostgreSQL server stopped.");
} catch {
  console.log("PostgreSQL was not running or could not be stopped.");
}
