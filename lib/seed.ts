// ─────────────────────────────────────────────
// TRACE — Database Seed Script
// Run: npx tsx lib/seed.ts
// ─────────────────────────────────────────────

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema";
import { demoUser, demoPatient, demoPatientProfile, seedTraces } from "./seed-data";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/trace";

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding TRACE database...\n");

  // 1. Insert demo user
  console.log("Creating demo user: %s (%s)", demoUser.name, demoUser.email);
  const [user] = await db
    .insert(schema.users)
    .values({
      email: demoUser.email,
      name: demoUser.name,
    })
    .returning();
  console.log("  User ID: %s", user.id);

  // 2. Insert patient profile
  console.log("Creating patient profile (genotype: %s)", demoPatientProfile.genotype);
  const [profile] = await db
    .insert(schema.patientProfiles)
    .values({
      userId: user.id,
      genotype: demoPatientProfile.genotype,
      hbfLevel: demoPatientProfile.hbfLevel,
      baselineSpo2: demoPatientProfile.baselineSpo2,
    })
    .returning();
  console.log("  Profile ID: %s", profile.id);

  // 3. Insert legacy patient record
  console.log("Creating legacy patient record...");
  const [patient] = await db
    .insert(schema.patients)
    .values({
      name: demoPatient.name,
      genotype: demoPatient.genotype,
      hbfLevel: demoPatient.hbfLevel,
      knownTriggers: demoPatient.knownTriggers,
      medications: demoPatient.medications,
      specialists: demoPatient.specialists,
    })
    .returning();
  console.log("  Patient ID: %s", patient.id);

  // 4. Insert traces with chains and suggestions
  console.log("\nSeeding %d traces...\n", seedTraces.length);

  for (const traceData of seedTraces) {
    // Insert the trace
    const [trace] = await db
      .insert(schema.traces)
      .values({
        patientId: patient.id,
        inputText: traceData.inputText,
        thinking: traceData.thinking,
        chains: traceData.chains,
        summary: traceData.summary,
        suggestions: traceData.suggestions,
        weatherData: traceData.weatherData,
        createdAt: traceData.createdAt,
      })
      .returning();

    console.log('  Trace: "%s"', traceData.inputText);
    console.log("    ID: %s | Created: %s", trace.id, traceData.createdAt.toLocaleDateString());

    // Insert normalized chain nodes
    for (const chain of traceData.chains) {
      for (let i = 0; i < chain.nodes.length; i++) {
        const node = chain.nodes[i];
        const parentNode = i > 0 ? chain.nodes[i - 1] : null;

        await db.insert(schema.traceChains).values({
          traceId: trace.id,
          nodeType: node.type,
          title: node.title,
          description: node.description,
          confidence: node.confidence,
          position: i,
          parentId: parentNode ? undefined : undefined, // parent references are within the chain JSON
        });
      }
    }

    // Insert normalized suggestions
    for (const suggestion of traceData.suggestions) {
      await db.insert(schema.suggestions).values({
        traceId: trace.id,
        text: suggestion.text,
        urgency: suggestion.urgency,
        forDoctor: suggestion.forDoctor,
      });
    }
  }

  console.log("\nSeed complete!");
  console.log("  Users: 1");
  console.log("  Patient profiles: 1");
  console.log("  Legacy patients: 1");
  console.log("  Traces: %d", seedTraces.length);
  console.log(
    "  Chain nodes: %d",
    seedTraces.reduce((sum, t) => sum + t.chains.reduce((s, c) => s + c.nodes.length, 0), 0),
  );
  console.log(
    "  Suggestions: %d",
    seedTraces.reduce((sum, t) => sum + t.suggestions.length, 0),
  );
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    client.end();
  });
