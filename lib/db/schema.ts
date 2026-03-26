import {
  pgTable,
  uuid,
  text,
  decimal,
  integer,
  boolean,
  jsonb,
  timestamp,
  real,
  date,
  index,
} from "drizzle-orm/pg-core";

// ── Users ──────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("patient"), // "patient" | "provider" | "admin"
  passwordHash: text("password_hash"),
  emailVerified: boolean("email_verified").notNull().default(false),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Patient Profiles ───────────────────────────
export const patientProfiles = pgTable("patient_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  genotype: text("genotype").notNull(), // e.g. "HbSS", "HbSC"
  hbfLevel: decimal("hbf_level"),
  baselineSpo2: decimal("baseline_spo2"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Legacy patients table (kept for compatibility) ──
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  genotype: text("genotype").notNull(),
  hbfLevel: decimal("hbf_level"),
  knownTriggers: text("known_triggers").array(),
  medications: jsonb("medications").default([]),
  specialists: jsonb("specialists").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const traces = pgTable(
  "traces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id").references(() => patients.id),
    userId: uuid("user_id").references(() => users.id), // links trace to authenticated user
    inputText: text("input_text").notNull(),
    thinking: text("thinking"),
    chains: jsonb("chains").notNull(),
    summary: text("summary"),
    suggestions: jsonb("suggestions").default([]),
    weatherData: jsonb("weather_data"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("traces_user_id_created_idx").on(table.userId, table.createdAt),
    index("traces_patient_id_created_idx").on(table.patientId, table.createdAt),
  ],
);

// ── Trace Chains (normalized chain nodes) ──────
export const traceChains = pgTable("trace_chains", {
  id: uuid("id").primaryKey().defaultRandom(),
  traceId: uuid("trace_id")
    .references(() => traces.id)
    .notNull(),
  nodeType: text("node_type").notNull(), // "symptom" | "mechanism" | "root-cause"
  title: text("title").notNull(),
  description: text("description"),
  confidence: real("confidence"),
  position: integer("position").notNull().default(0),
  parentId: uuid("parent_id"),
});

// ── Suggestions (normalized) ───────────────────
export const suggestions = pgTable("suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  traceId: uuid("trace_id")
    .references(() => traces.id)
    .notNull(),
  text: text("text").notNull(),
  urgency: text("urgency").notNull().default("info"), // "info" | "discuss" | "urgent"
  forDoctor: boolean("for_doctor").notNull().default(false),
});

export const visitCards = pgTable("visit_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  traceId: uuid("trace_id").references(() => traces.id),
  patientId: uuid("patient_id").references(() => patients.id),
  doctorName: text("doctor_name"),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Health Records (Apple Health data) ────────
export const healthRecords = pgTable("health_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  recordType: text("record_type").notNull(), // heart_rate, hrv, resting_heart_rate, sleep, vo2_max, step_count, active_energy, six_min_walk
  value: real("value"),
  unit: text("unit"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  sourceName: text("source_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Daily Baselines ──────────────────────────
export const dailyBaselines = pgTable("daily_baselines", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  date: date("date").notNull(),
  avgHeartRate: real("avg_heart_rate"),
  minHeartRate: real("min_heart_rate"),
  maxHeartRate: real("max_heart_rate"),
  restingHeartRate: real("resting_heart_rate"),
  hrvSdnn: real("hrv_sdnn"),
  sleepDurationHours: real("sleep_duration_hours"),
  stepCount: integer("step_count"),
  activeEnergy: real("active_energy"),
  vo2Max: real("vo2_max"),
  riskScore: real("risk_score"),
});

// ── Personal Baselines ───────────────────────
export const personalBaselines = pgTable("personal_baselines", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  metric: text("metric").notNull(), // heart_rate, hrv, resting_hr, sleep, steps, vo2_max
  avgValue: real("avg_value"),
  stdDev: real("std_dev"),
  minNormal: real("min_normal"),
  maxNormal: real("max_normal"),
  computedFromDays: integer("computed_from_days"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
});

// ── Practices (multi-tenant) ─────────────────
export const practices = pgTable("practices", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  npi: text("npi"), // National Provider Identifier
  address: jsonb("address"),
  settings: jsonb("settings").default({}), // notification prefs, feature flags
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ── Practice Members ─────────────────────────
export const practiceMembers = pgTable(
  "practice_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    practiceId: uuid("practice_id")
      .references(() => practices.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    role: text("role").notNull().default("provider"), // "admin" | "provider" | "nurse" | "staff"
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("practice_members_practice_idx").on(table.practiceId),
    index("practice_members_user_idx").on(table.userId),
  ],
);

// ── Patient-Practice Links ───────────────────
export const patientPracticeLinks = pgTable(
  "patient_practice_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientProfileId: uuid("patient_profile_id")
      .references(() => patientProfiles.id)
      .notNull(),
    practiceId: uuid("practice_id")
      .references(() => practices.id)
      .notNull(),
    linkedBy: uuid("linked_by").references(() => users.id),
    status: text("status").notNull().default("active"), // "active" | "revoked"
    linkedAt: timestamp("linked_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("patient_practice_links_practice_idx").on(table.practiceId, table.status),
    index("patient_practice_links_patient_idx").on(table.patientProfileId),
  ],
);

// ── Sessions (server-side, HIPAA-compliant) ──
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("sessions_token_idx").on(table.token),
    index("sessions_user_idx").on(table.userId),
  ],
);

// ── Shared Traces ────────────────────────────
export const sharedTraces = pgTable(
  "shared_traces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    traceId: uuid("trace_id")
      .references(() => traces.id)
      .notNull(),
    patientUserId: uuid("patient_user_id")
      .references(() => users.id)
      .notNull(),
    practiceId: uuid("practice_id")
      .references(() => practices.id)
      .notNull(),
    note: text("note"),
    sharedAt: timestamp("shared_at", { withTimezone: true }).defaultNow(),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    viewedBy: uuid("viewed_by").references(() => users.id),
  },
  (table) => [
    index("shared_traces_practice_idx").on(table.practiceId, table.viewedAt),
    index("shared_traces_trace_idx").on(table.traceId),
  ],
);

// ── Audit Logs (HIPAA requirement) ───────────
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    action: text("action").notNull(), // "login" | "logout" | "view_trace" | "create_trace" | "share_trace" | etc.
    resourceType: text("resource_type"), // "trace" | "patient" | "practice"
    resourceId: uuid("resource_id"),
    metadata: jsonb("metadata").default({}),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("audit_logs_user_created_idx").on(table.userId, table.createdAt),
    index("audit_logs_resource_idx").on(table.resourceType, table.resourceId),
  ],
);
