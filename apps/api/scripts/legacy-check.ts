import { app } from "../src/app.js";
import type { Server } from "node:http";

async function main() {
  const server: Server = app.listen(0);
  await new Promise<void>((r) => server.once("listening", () => r()));
  const port = (server.address() as any).port;
  const base = `http://127.0.0.1:${port}`;

  const reg = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `legacy${Date.now()}@t.uz`, password: "Test12345", firstName: "L", gender: "OTHER" }),
  });
  const regBody = await reg.json();
  const token = regBody.token;

  const q = await fetch(`${base}/api/learning/placement`, { headers: { Authorization: `Bearer ${token}` } });
  console.log("legacy q:", q.status, (await q.json()).length);

  const s = await fetch(`${base}/api/learning/placement`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ answers: {} }),
  });
  console.log("legacy post:", s.status, (await s.json()).earned ?? "err");

  server.close();
}

main();