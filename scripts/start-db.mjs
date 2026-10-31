import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import net from "net";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dbDir = path.join(rootDir, ".db");
const binDir = path.join(dbDir, "pgsql", "bin");
const dataDir = path.join(dbDir, "data");
const logFile = path.join(dbDir, "logfile.log");
const pgCtl = path.join(binDir, "pg_ctl.exe");
const createdb = path.join(binDir, "createdb.exe");

function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const isOpen = await isPortOpen(5432);
  if (isOpen) {
    console.log("PostgreSQL is already active on port 5432.");
  } else {
    console.log("Starting local PostgreSQL server...");
    execSync(`"${pgCtl}" -D "${dataDir}" -l "${logFile}" -w start`, {
      stdio: "inherit",
    });
    console.log("PostgreSQL server started.");
  }

  // Ensure 'brightloop' database exists
  try {
    process.env.PGPASSWORD = "postgres";
    execSync(`"${createdb}" -h localhost -p 5432 -U postgres brightloop`, {
      stdio: "pipe",
    });
    console.log("Database 'brightloop' created.");
  } catch (err) {
    // Already exists or created
    console.log("Database 'brightloop' is ready.");
  }
}

main().catch((err) => {
  console.error("Failed to start database:", err);
  process.exit(1);
});
