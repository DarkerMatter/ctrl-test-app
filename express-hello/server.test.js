const { test } = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

function freePort() {
  return new Promise((resolve) => {
    const s = net.createServer().listen(0, () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

async function start(env) {
  const port = await freePort();
  const child = spawn(process.execPath, [path.join(__dirname, "server.js")], {
    env: { ...process.env, CTRL_TEST_ENDPOINTS: "", ...env, PORT: String(port) },
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise((resolve) => child.stdout.once("data", resolve));
  return { child, base: `http://127.0.0.1:${port}` };
}

test("/__ctrl/crash and /__ctrl/oom are 404 unless CTRL_TEST_ENDPOINTS=1", async () => {
  const { child, base } = await start({});
  try {
    for (const p of ["/__ctrl/crash", "/__ctrl/oom"]) {
      assert.strictEqual((await fetch(base + p)).status, 404);
    }
    assert.strictEqual((await fetch(base + "/")).status, 200);
    assert.strictEqual(child.exitCode, null);
  } finally {
    child.kill("SIGKILL");
  }
});

test("/__ctrl/crash responds then exits with code 1", async () => {
  const { child, base } = await start({ CTRL_TEST_ENDPOINTS: "1" });
  const exited = new Promise((resolve) => child.once("exit", (code) => resolve(code)));
  try {
    const res = await fetch(base + "/__ctrl/crash");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(await exited, 1);
  } finally {
    child.kill("SIGKILL");
  }
});

test("/__ctrl/oom responds when enabled", async () => {
  const { child, base } = await start({ CTRL_TEST_ENDPOINTS: "1" });
  try {
    assert.strictEqual((await fetch(base + "/__ctrl/oom")).status, 200);
  } finally {
    child.kill("SIGKILL"); // don't let it actually eat the host's memory
  }
});
