/**
 * In-process smoke test for the content / adaptive-placement / SRS routes.
 * Boots the real Express app on an ephemeral port so no background process
 * juggling is needed: `npx tsx scripts/smoke-content.ts`.
 */
import { app } from "../src/app.js";
import type { Server } from "node:http";

const stamp = Date.now();
let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

async function req(
  path: string,
  opts: { method?: string; body?: unknown; token?: string } = {}
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, body: json };
}

let port = 0;
let server: Server;

async function main() {
  server = app.listen(0);
  await new Promise<void>((r) => server.once("listening", () => r()));
  port = (server.address() as any).port;

  // ── auth ────────────────────────────────────────────────────────────────
  section("auth");
  const reg = await req("/api/auth/register", {
    body: { email: `smoke${stamp}@test.uz`, password: "Test12345", firstName: "Ali", gender: "MALE" },
  });
  check("register returns 2xx", reg.status === 200 || reg.status === 201, `status=${reg.status}`);
  const token = reg.body?.token;
  check("register returns token", Boolean(token));
  if (!token) {
    console.log("\ncannot continue without a token");
    return;
  }

  // ── catalog ─────────────────────────────────────────────────────────────
  section("catalog");
  const courses = await req("/api/content/courses", { token });
  check("courses list", courses.status === 200 && Array.isArray(courses.body), `n=${courses.body?.length}`);
  check("all 7 courses seeded", courses.body?.length === 7, `got ${courses.body?.length}`);
  const totalLessons = courses.body?.reduce((s: number, c: any) => s + c.lessonCount, 0) ?? 0;
  check("38 lessons across courses", totalLessons === 38, `got ${totalLessons}`);

  const detail = await req("/api/content/courses/sat", { token });
  check("course detail", detail.status === 200 && detail.body?.modules?.length > 0);
  const firstLesson = detail.body?.modules?.[0]?.lessons?.[0];
  check("lesson has blocks + objectives", firstLesson?.blockCount > 0 && firstLesson?.objectives?.length > 0,
    `blocks=${firstLesson?.blockCount} objectives=${firstLesson?.objectives?.length}`);

  const lesson = await req(`/api/content/lessons/${firstLesson.slug}`, { token });
  check("lesson detail blocks", lesson.status === 200 && lesson.body?.blocks?.length === firstLesson.blockCount,
    `got ${lesson.body?.blocks?.length}`);
  check("block content non-empty", Boolean(lesson.body?.blocks?.[0]?.content));

  const skills = await req("/api/content/skills", { token });
  check("skills list", skills.status === 200 && skills.body?.length === 29, `got ${skills.body?.length}`);
  check("fresh user has null mastery", skills.body?.every((s: any) => s.mastery === null));

  // ── enrollment ──────────────────────────────────────────────────────────
  section("enrollment");
  const e1 = await req("/api/content/courses/sat/enroll", { token, body: {} });
  const e2 = await req("/api/content/courses/sat/enroll", { token, body: {} });
  check("enroll works", e1.status === 200 && e1.body?.enrolled);
  check("enroll is idempotent", e2.status === 200 && e2.body?.enrolled);

  // ── adaptive placement ──────────────────────────────────────────────────
  section("adaptive placement (Rasch IRT)");
  const start = await req("/api/content/placement/start", { token });
  check("placement starts", start.status === 200 && Boolean(start.body?.question), `status=${start.status}`);
  let q = start.body.question;
  check("answer key never sent to client",
    !q.options.some((o: any) => "correct" in o));
  check("no 'accepts' leaked for MCQ",
    q.options.every((o: any) => !("accepts" in o)));

  const seen = new Set<string>();
  let items = 0;
  let final: any = null;
  while (items < 40) {
    if (seen.has(q.id)) { check("no repeated items", false, `repeat ${q.id}`); break; }
    seen.add(q.id);
    const answer = await req("/api/content/placement/answer", {
      token,
      body: { questionId: q.id, given: q.options[0].label, ms: 20_000 },
    });
    items += 1;
    if (answer.status !== 200) { check("answer accepted", false, `status=${answer.status}`); break; }
    if (answer.body?.finished) { final = answer.body; break; }
    q = answer.body?.question;
    if (!q) break;
  }
  check("placement converges", Boolean(final), `after ${items} items`);
  if (final) {
    check("stops within 15..25 items", items >= 15 && items <= 25, `items=${items}`);
    check("theta within -3..3", final.theta >= -3 && final.theta <= 3, `theta=${final.theta.toFixed(3)}`);
    check("scaled score 400..1600", final.scaled >= 400 && final.scaled <= 1600, `scaled=${final.scaled}`);
    check("level mapped to 0..10", final.currentLevel >= 0 && final.currentLevel <= 10, `level=${final.currentLevel}`);
    check("plan mode returned", ["STARTER", "STANDARD", "INTENSIVE"].includes(final.planMode), final.planMode);
    check("answered count matches", final.answered === items, `${final.answered} vs ${items}`);
  }

  // ── practice + FSRS ─────────────────────────────────────────────────────
  section("practice + FSRS");
  const exclusions: string[] = [];
  const intervals: string[] = [];
  let correctCount = 0;
  for (let i = 0; i < 6; i += 1) {
    const p = await req(`/api/content/practice/next?exclude=${exclusions.join(",")}`, { token });
    if (p.status !== 200 || !p.body?.question) { check("practice serves question", false, `status=${p.status}`); break; }
    const pq = p.body.question;
    exclusions.push(pq.id);
    const a = await req("/api/content/practice/answer", {
      token,
      body: { questionId: pq.id, given: pq.options[0].label, ms: 15_000 },
    });
    check(`practice answer ${i + 1} graded`, a.status === 200 && typeof a.body?.correct === "boolean",
      `correct=${a.body?.correct}`);
    if (a.body?.correct) correctCount += 1;
    intervals.push(a.body?.review?.interval ?? "-");
  }
  check("questions not repeated", new Set(exclusions).size === exclusions.length);
  check("FSRS intervals are human strings", intervals.every((s) => typeof s === "string" && s.length > 0),
    intervals.join(", "));

  const rev = await req("/api/content/reviews", { token });
  check("reviews endpoint", rev.status === 200);
  check("review cards created", rev.body?.summary?.totalCards >= 6, `cards=${rev.body?.summary?.totalCards}`);
  check("7-day load is 7 buckets", rev.body?.summary?.next7Days?.length === 7);
  check("weak skills reported", Array.isArray(rev.body?.summary?.weakSkills));

  // ── level progression ───────────────────────────────────────────────────
  section("level progression");
  const me = await req("/api/user/me", { token });
  check("level persists to user", me.body?.user?.currentLevel >= 0, `level=${me.body?.user?.currentLevel}`);
  const startLevel = me.body?.user?.currentLevel;
  if (correctCount > 0) {
    check("level can rise", me.body.user.currentLevel >= final?.currentLevel - 1,
      `${startLevel} -> ${me.body.user.currentLevel}`);
  } else {
    check("level unchanged when all wrong", me.body.user.currentLevel === final?.currentLevel);
  }

  // ── security ────────────────────────────────────────────────────────────
  section("security");
  const noAuth = await req("/api/content/courses");
  check("unauthenticated request rejected", noAuth.status === 401, `status=${noAuth.status}`);

  const other = await req("/api/auth/register", {
    body: { email: `other${stamp}@test.uz`, password: "Test12345", firstName: "Bob", gender: "MALE" },
  });
  check("other user registered", other.status >= 200 && other.status < 300 && Boolean(other.body?.token));
  const crossUser = await req("/api/content/reviews", { token: other.body?.token });
  check("other user sees their own (empty) cards", crossUser.body?.summary?.totalCards === 0,
    `cards=${crossUser.body?.summary?.totalCards}`);
  const badToken = await req("/api/content/courses", { token: "not-a-real-token" });
  check("forged token rejected", badToken.status === 401, `status=${badToken.status}`);

  const badAnswer = await req("/api/content/practice/answer", {
    token, body: { questionId: "does-not-exist", given: "x" },
  });
  check("unknown question id handled", badAnswer.status === 404, `status=${badAnswer.status}`);

  const badSchema = await req("/api/content/practice/answer", {
    token, body: { questionId: "", given: "" },
  });
  check("malformed body rejected", badSchema.status === 400, `status=${badSchema.status}`);
}

main()
  .catch((err) => {
    failed += 1;
    console.error("\nunexpected error:", err);
  })
  .finally(async () => {
    console.log(`\n${"=".repeat(46)}`);
    console.log(`  passed: ${passed}   failed: ${failed}`);
    console.log("=".repeat(46));
    await new Promise<void>((r) => server?.close(() => r()));
    process.exit(failed > 0 ? 1 : 0);
  });