// ─────────────────────────────────────────────
// TRACE — Database Seed Script
// Run: bun run db:seed
// ─────────────────────────────────────────────

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hashSync } from "bcryptjs";
import * as schema from "./db/schema";
import {
  demoUser,
  demoPatient,
  demoPatientProfile,
  seedTraces,
  guestPatient,
  guestProvider,
  demoPractice,
} from "./seed-data";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/trace";

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding TRACE database...\n");

  // 1. Insert demo user (legacy, no password)
  console.log("Creating demo user: %s (%s)", demoUser.name, demoUser.email);
  const [user] = await db
    .insert(schema.users)
    .values({
      email: demoUser.email,
      name: demoUser.name,
      role: "patient",
    })
    .returning();
  console.log("  User ID: %s", user.id);

  // 2. Insert guest patient account
  console.log("Creating guest patient: %s (%s)", guestPatient.name, guestPatient.email);
  const [guestPatientUser] = await db
    .insert(schema.users)
    .values({
      email: guestPatient.email,
      name: guestPatient.name,
      role: guestPatient.role,
      passwordHash: hashSync(guestPatient.password, 12),
    })
    .returning();
  console.log("  Guest Patient ID: %s", guestPatientUser.id);

  // 3. Insert guest provider account
  console.log("Creating guest provider: %s (%s)", guestProvider.name, guestProvider.email);
  const [guestProviderUser] = await db
    .insert(schema.users)
    .values({
      email: guestProvider.email,
      name: guestProvider.name,
      role: guestProvider.role,
      passwordHash: hashSync(guestProvider.password, 12),
    })
    .returning();
  console.log("  Guest Provider ID: %s", guestProviderUser.id);

  // 4. Insert patient profile for guest patient
  console.log("Creating patient profile (genotype: %s)", demoPatientProfile.genotype);
  const [profile] = await db
    .insert(schema.patientProfiles)
    .values({
      userId: guestPatientUser.id,
      genotype: demoPatientProfile.genotype,
      hbfLevel: demoPatientProfile.hbfLevel,
      baselineSpo2: demoPatientProfile.baselineSpo2,
    })
    .returning();
  console.log("  Profile ID: %s", profile.id);

  // 5. Insert legacy patient record
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

  // 6. Insert demo practice
  console.log("\nCreating demo practice: %s", demoPractice.name);
  const [practice] = await db
    .insert(schema.practices)
    .values({
      name: demoPractice.name,
      slug: demoPractice.slug,
      npi: demoPractice.npi,
      address: demoPractice.address,
    })
    .returning();
  console.log("  Practice ID: %s", practice.id);

  // 7. Add guest provider as practice admin
  console.log("Adding provider to practice as admin...");
  await db.insert(schema.practiceMembers).values({
    practiceId: practice.id,
    userId: guestProviderUser.id,
    role: "admin",
    acceptedAt: new Date(),
  });

  // 8. Link guest patient to practice
  console.log("Linking patient to practice...");
  await db.insert(schema.patientPracticeLinks).values({
    patientProfileId: profile.id,
    practiceId: practice.id,
    linkedBy: guestPatientUser.id,
    status: "active",
  });

  // 9. Insert traces with chains and suggestions
  console.log("\nSeeding %d traces...\n", seedTraces.length);

  for (const traceData of seedTraces) {
    const [trace] = await db
      .insert(schema.traces)
      .values({
        patientId: patient.id,
        userId: guestPatientUser.id,
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

        await db.insert(schema.traceChains).values({
          traceId: trace.id,
          nodeType: node.type,
          title: node.title,
          description: node.description,
          confidence: node.confidence,
          position: i,
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
  console.log("  Users: 3 (demo + guest patient + guest provider)");
  console.log("  Patient profiles: 1");
  console.log("  Legacy patients: 1");
  console.log("  Practices: 1");
  console.log("  Practice members: 1");
  console.log("  Patient-practice links: 1");
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
