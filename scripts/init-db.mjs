import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dbDir = path.join(rootDir, ".db");
const zipPath = path.join(dbDir, "pgsql.zip");
const pgsqlDir = path.join(dbDir, "pgsql");
const dataDir = path.join(dbDir, "data");
const binDir = path.join(pgsqlDir, "bin");
const postgresExe = path.join(binDir, "postgres.exe");
const initdbExe = path.join(binDir, "initdb.exe");
const createdbExe = path.join(binDir, "createdb.exe");

async function main() {
  console.log("=== Brightloop PostgreSQL Setup ===");

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // 1. Extract zip if postgres.exe doesn't exist
  if (!fs.existsSync(postgresExe)) {
    if (!fs.existsSync(zipPath)) {
      console.error(`PostgreSQL archive not found at ${zipPath}`);
      process.exit(1);
    }
    console.log(`Extracting PostgreSQL binaries from ${zipPath} to ${dbDir}...`);
    // Use PowerShell Expand-Archive
    execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${dbDir}' -Force"`, {
      stdio: "inherit",
    });
    console.log("Extraction complete.");
  } else {
    console.log("PostgreSQL binaries found.");
  }

  // 2. Initialize cluster if data dir doesn't exist
  const pgVersionFile = path.join(dataDir, "PG_VERSION");
  if (!fs.existsSync(pgVersionFile)) {
    console.log(`Initializing database cluster at ${dataDir}...`);
    const pwFile = path.join(dbDir, "pw.txt");
    fs.writeFileSync(pwFile, "postgres\n", "utf8");

    try {
      execSync(`"${initdbExe}" -D "${dataDir}" -U postgres --pwfile="${pwFile}" -A scram-sha-256 --encoding=UTF8`, {
        stdio: "inherit",
      });
      console.log("Database cluster initialized successfully.");
    } finally {
      if (fs.existsSync(pwFile)) fs.unlinkSync(pwFile);
    }
  } else {
    console.log("Database cluster directory already exists.");
  }
}

main().catch((err) => {
  console.error("Error setting up database:", err);
  process.exit(1);
});
