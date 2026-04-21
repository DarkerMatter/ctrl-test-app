const express = require("express");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 8080;
const APP_ID = process.env.CTRL_APP_ID || "unknown";

app.get("/", (req, res) => {
  res.json({
    app: "ctrl-test-app",
    status: "running",
    app_id: APP_ID,
    hostname: os.hostname(),
    uptime: Math.floor(process.uptime()),
    node: process.version,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/env", (req, res) => {
  // Show CTRL-injected env vars (filter to CTRL_ prefix for safety)
  const ctrlVars = Object.fromEntries(
    Object.entries(process.env).filter(([k]) => k.startsWith("CTRL_") || k === "PORT")
  );
  res.json(ctrlVars);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ctrl-test-app listening on port ${PORT}`);
});
