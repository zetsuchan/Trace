import { db } from "./db";
import { users, traces, traceChains, suggestions, healthRecords, dailyBaselines, personalBaselines } from "./db/schema";
import { sql } from "drizzle-orm";

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}: ${err instanceof Error ? err.message : err}`);
    failed++;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function run() {
  console.log("\n═══════════════════════════════════════════");
  console.log("  TRACE Test Suite");
  console.log("═══════════════════════════════════════════\n");

  // ── Database Connectivity ──
  console.log("Database Connectivity:");

  await test("Can connect to Postgres", async () => {
    const result = await db.execute(sql`SELECT 1 as ok`);
    assert(result.length > 0, "No result from SELECT 1");
  });

  await test("All 10 tables exist", async () => {
    const result = await db.execute(sql`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);
    assert(result.length >= 10, `Expected 10+ tables, got ${result.length}`);
  });

  // ── Health Data ──
  console.log("\nHealth Data:");

  await test("health_records has data", async () => {
    const result = await db.execute(sql`SELECT COUNT(*) as cnt FROM health_records`);
    const count = Number((result as any)[0]?.cnt || 0);
    assert(count > 100000, `Expected >100K health records, got ${count}`);
    console.log(`    → ${count.toLocaleString()} records`);
  });

  await test("health_records has all SCD-relevant types", async () => {
    const result = await db.execute(sql`
      SELECT record_type, COUNT(*) as cnt FROM health_records GROUP BY record_type ORDER BY cnt DESC
    `);
    const types = (result as any[]).map((r: any) => r.record_type);
    for (const expected of ["heart_rate", "hrv", "resting_heart_rate", "sleep"]) {
      assert(types.includes(expected), `Missing record type: ${expected}`);
    }
  });

  await test("daily_baselines computed", async () => {
    const result = await db.execute(sql`SELECT COUNT(*) as cnt FROM daily_baselines`);
    const count = Number((result as any)[0]?.cnt || 0);
    assert(count > 100, `Expected >100 daily baselines, got ${count}`);
    console.log(`    → ${count} days`);
  });

  await test("personal_baselines computed", async () => {
    const result = await db.execute(sql`SELECT * FROM personal_baselines`);
    assert(result.length >= 4, `Expected >=4 personal baselines, got ${result.length}`);
    for (const row of result as any[]) {
      console.log(`    → ${row.metric}: avg=${Number(row.avg_value).toFixed(1)}, stddev=${Number(row.std_dev).toFixed(1)}`);
    }
  });

  // ── Seed Data ──
  console.log("\nSeed Data:");

  await test("Demo user exists", async () => {
    const result = await db.execute(sql`SELECT name, email FROM users LIMIT 5`);
    assert(result.length > 0, "No users found");
    console.log(`    → ${(result as any[])[0]?.name} (${(result as any[])[0]?.email})`);
  });

  await test("Traces seeded", async () => {
    const result = await db.execute(sql`SELECT COUNT(*) as cnt FROM traces`);
    const count = Number((result as any)[0]?.cnt || 0);
    assert(count >= 3, `Expected >=3 traces, got ${count}`);
    console.log(`    → ${count} traces`);
  });

  await test("Chain nodes seeded", async () => {
    const result = await db.execute(sql`SELECT COUNT(*) as cnt FROM trace_chains`);
    const count = Number((result as any)[0]?.cnt || 0);
    assert(count >= 5, `Expected >=5 chain nodes, got ${count}`);
    console.log(`    → ${count} chain nodes`);
  });

  await test("Suggestions seeded", async () => {
    const result = await db.execute(sql`SELECT COUNT(*) as cnt FROM suggestions`);
    const count = Number((result as any)[0]?.cnt || 0);
    assert(count >= 3, `Expected >=3 suggestions, got ${count}`);
    console.log(`    → ${count} suggestions`);
  });

  // ── API Routes (no Claude API calls) ──
  console.log("\nAPI Routes:");

  await test("GET /api/health returns valid JSON", async () => {
    const res = await fetch("http://localhost:3000/api/health");
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.personalBaselines, "Missing personalBaselines");
    assert(data.summary, "Missing summary");
    console.log(`    → ${data.summary.totalRecords} total records reported`);
  });

  // ── Page Routes ──
  console.log("\nPage Routes:");

  const pages = [
    { path: "/", name: "Home" },
    { path: "/login", name: "Login" },
    { path: "/trace/new", name: "Trace Input" },
    { path: "/history", name: "History" },
    { path: "/insights", name: "Insights" },
    { path: "/analytics", name: "Analytics" },
  ];

  for (const page of pages) {
    await test(`${page.name} (${page.path}) returns 200`, async () => {
      const res = await fetch(`http://localhost:3000${page.path}`);
      assert(res.ok, `Status ${res.status}`);
    });
  }

  // ── Obsidian Connectivity ──
  console.log("\nObsidian MCP:");

  await test("Obsidian REST API reachable", async () => {
    try {
      const res = await fetch("http://localhost:27124/", {
        headers: { Authorization: `Bearer ${process.env.OBSIDIAN_API_KEY || ""}` },
      });
      // Even a 401 means the server is reachable
      assert(res.status < 500, `Server error: ${res.status}`);
      console.log(`    → Status ${res.status}`);
    } catch {
      console.log("    → Not reachable (optional — app works without it)");
    }
  });

  // ── Summary ──
  console.log("\n═══════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`  Score: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log("═══════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

run();
