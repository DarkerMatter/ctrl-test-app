const http = require("http");
const os = require("os");

const PORT = process.env.PORT || 8080;
const APP_ID = process.env.CTRL_APP_ID || "unknown";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    app: "ctrl-test-app",
    status: "running",
    app_id: APP_ID,
    hostname: os.hostname(),
    uptime: Math.floor(process.uptime()),
    node: process.version,
    timestamp: new Date().toISOString(),
  }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ctrl-test-app listening on port ${PORT}`);
});

server.on("error", (err) => {
  console.error(`Server error: ${err.message}`);
  process.exit(1);
});
