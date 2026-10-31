const http = require("http");
const os = require("os");

const PORT = process.env.PORT || 8080;
const APP_ID = process.env.CTRL_APP_ID || "unknown";

const TEST_ENDPOINTS = process.env.CTRL_TEST_ENDPOINTS === "1";
const hog = [];

const server = http.createServer((req, res) => {
  if (req.url === "/__ctrl/crash" || req.url === "/__ctrl/oom") {
    if (!TEST_ENDPOINTS) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }), () => {
      if (req.url === "/__ctrl/crash") process.exit(1);
      // Buffers live outside the V8 heap and fill(1) touches the pages, so the kernel OOM-killer
      // (not V8's heap limit) ends the process.
      setInterval(() => hog.push(Buffer.alloc(32 * 1024 * 1024, 1)), 50);
    });
    return;
  }

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
