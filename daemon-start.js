/* eslint-disable @typescript-eslint/no-require-imports */
// Daemon launcher with auto-restart — if next-server dies, it respawns automatically
const { spawn } = require("child_process");
const fs = require("fs");

const LOG_PATH = "/home/z/my-project/dev.log";
const PID_PATH = "/home/z/my-project/.dev-pid";

function startServer() {
  const log = fs.openSync(LOG_PATH, "a");
  const child = spawn(
    "/home/z/my-project/node_modules/.bin/next",
    ["dev", "-p", "3000"],
    {
      cwd: "/home/z/my-project",
      detached: true,
      stdio: ["ignore", log, log],
      env: { ...process.env, NODE_ENV: "development" },
    }
  );

  child.unref();
  fs.writeFileSync(PID_PATH, String(child.pid));
  console.log("Server spawned PID:", child.pid);

  // Listen for exit — if server dies, wait 3s and restart
  child.on("exit", (code, signal) => {
    console.log(`Server exited (code=${code}, signal=${signal}). Restarting in 3s...`);
    setTimeout(startServer, 3000);
  });

  return child;
}

// Kill any existing server first
try {
  const oldPid = fs.readFileSync(PID_PATH, "utf-8").trim();
  if (oldPid) {
    try { process.kill(parseInt(oldPid), "SIGKILL"); } catch {}
  }
} catch {}

// Start fresh
startServer();
process.exit(0);
