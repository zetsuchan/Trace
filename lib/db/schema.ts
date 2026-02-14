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
} from "drizzle-orm/pg-core";

// ── Users ──────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
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

export const traces = pgTable("traces", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").references(() => patients.id),
  inputText: text("input_text").notNull(),
  thinking: text("thinking"),
  chains: jsonb("chains").notNull(),
  summary: text("summary"),
  suggestions: jsonb("suggestions").default([]),
  weatherData: jsonb("weather_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

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
