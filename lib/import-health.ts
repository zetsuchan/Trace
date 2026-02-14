import { createReadStream } from "fs";
import sax from "sax";
import { db } from "./db";
import { healthRecords } from "./db/schema";
import { sql } from "drizzle-orm";

const HEALTH_FILE = "/Users/danchou/Downloads/apple_health_export 2/export.xml";

// Only import SCD-relevant types
const RELEVANT_TYPES: Record<string, string> = {
  HKQuantityTypeIdentifierHeartRate: "heart_rate",
  HKQuantityTypeIdentifierHeartRateVariabilitySDNN: "hrv",
  HKQuantityTypeIdentifierRestingHeartRate: "resting_heart_rate",
  HKCategoryTypeIdentifierSleepAnalysis: "sleep",
  HKQuantityTypeIdentifierVO2Max: "vo2_max",
  HKQuantityTypeIdentifierStepCount: "step_count",
  HKQuantityTypeIdentifierActiveEnergyBurned: "active_energy",
  HKQuantityTypeIdentifierSixMinuteWalkTestDistance: "six_min_walk",
};

interface HealthRecord {
  recordType: string;
  value: number | null;
  unit: string | null;
  startDate: Date;
  endDate: Date;
  sourceName: string | null;
}

async function importHealthData() {
  console.log("Starting health data import...");

  const records: HealthRecord[] = [];
  let totalParsed = 0;
  let totalRelevant = 0;

  return new Promise<void>((resolve, reject) => {
    const stream = sax.createStream(true, { trim: true });

    stream.on("opentag", (tag) => {
      if (tag.name === "Record" && tag.attributes.type) {
        const type = tag.attributes.type as string;
        const mapped = RELEVANT_TYPES[type];

        if (mapped) {
          totalRelevant++;

          // For sleep, derive duration from start/end
          let value = tag.attributes.value
            ? parseFloat(tag.attributes.value as string)
            : null;
          if (
            mapped === "sleep" &&
            tag.attributes.startDate &&
            tag.attributes.endDate
          ) {
            const start = new Date(tag.attributes.startDate as string);
            const end = new Date(tag.attributes.endDate as string);
            value = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
          }

          records.push({
            recordType: mapped,
            value,
            unit: (tag.attributes.unit as string) || null,
            startDate: new Date(tag.attributes.startDate as string),
            endDate: new Date(tag.attributes.endDate as string),
            sourceName: (tag.attributes.sourceName as string) || null,
          });

          // Batch insert every 5000 records
          if (records.length >= 5000) {
            const batch = records.splice(0, records.length);
            insertBatch(batch).catch(console.error);
          }

          if (totalRelevant % 50000 === 0) {
            console.log(`  Parsed ${totalRelevant} relevant records...`);
          }
        }

        totalParsed++;
        if (totalParsed % 500000 === 0) {
          console.log(`Scanned ${totalParsed} total records...`);
        }
      }
    });

    stream.on("end", async () => {
      // Insert remaining records
      if (records.length > 0) {
        await insertBatch(records);
      }

      console.log(
        `\nImport complete: ${totalRelevant} relevant records from ${totalParsed} total`
      );

      // Compute daily baselines
      console.log("\nComputing daily baselines...");
      await computeDailyBaselines();

      // Compute personal baselines
      console.log("Computing personal baselines...");
      await computePersonalBaselines();

      console.log("\nDone!");
      resolve();
    });

    stream.on("error", reject);

    createReadStream(HEALTH_FILE).pipe(stream);
  });
}

async function insertBatch(batch: HealthRecord[]) {
  await db.insert(healthRecords).values(
    batch.map((r) => ({
      recordType: r.recordType,
      value: r.value,
      unit: r.unit,
      startDate: r.startDate,
      endDate: r.endDate,
      sourceName: r.sourceName,
    }))
  );
}

async function computeDailyBaselines() {
  // Aggregate health records by day
  await db.execute(sql`
    INSERT INTO daily_baselines (id, date, avg_heart_rate, min_heart_rate, max_heart_rate, resting_heart_rate, hrv_sdnn, sleep_duration_hours, step_count, active_energy, vo2_max, risk_score)
    SELECT
      gen_random_uuid(),
      DATE(start_date) as day,
      AVG(CASE WHEN record_type = 'heart_rate' THEN value END) as avg_hr,
      MIN(CASE WHEN record_type = 'heart_rate' THEN value END) as min_hr,
      MAX(CASE WHEN record_type = 'heart_rate' THEN value END) as max_hr,
      AVG(CASE WHEN record_type = 'resting_heart_rate' THEN value END) as resting_hr,
      AVG(CASE WHEN record_type = 'hrv' THEN value END) as hrv,
      SUM(CASE WHEN record_type = 'sleep' THEN value END) as sleep_hrs,
      SUM(CASE WHEN record_type = 'step_count' THEN value END)::int as steps,
      SUM(CASE WHEN record_type = 'active_energy' THEN value END) as energy,
      AVG(CASE WHEN record_type = 'vo2_max' THEN value END) as vo2,
      0 as risk
    FROM health_records
    GROUP BY DATE(start_date)
    ORDER BY day
  `);

  // Compute risk scores based on deviations
  await db.execute(sql`
    UPDATE daily_baselines SET risk_score = LEAST(100, GREATEST(0,
      COALESCE((avg_heart_rate - 70) * 2, 0) +
      COALESCE((60 - COALESCE(hrv_sdnn, 60)) * 1.5, 0) +
      COALESCE((7 - COALESCE(sleep_duration_hours, 7)) * 10, 0)
    ))
  `);

  const result = await db.execute(
    sql`SELECT COUNT(*) as cnt FROM daily_baselines`
  );
  console.log(
    `  Created ${(result as any)[0]?.cnt || "unknown"} daily baseline records`
  );
}

async function computePersonalBaselines() {
  const metrics = [
    { metric: "heart_rate", type: "heart_rate" },
    { metric: "hrv", type: "hrv" },
    { metric: "resting_heart_rate", type: "resting_heart_rate" },
    { metric: "sleep", type: "sleep" },
    { metric: "step_count", type: "step_count" },
    { metric: "vo2_max", type: "vo2_max" },
  ];

  for (const m of metrics) {
    await db.execute(sql`
      INSERT INTO personal_baselines (id, metric, avg_value, std_dev, min_normal, max_normal, computed_from_days)
      SELECT
        gen_random_uuid(),
        ${m.metric},
        AVG(value),
        STDDEV(value),
        AVG(value) - STDDEV(value),
        AVG(value) + STDDEV(value),
        COUNT(DISTINCT DATE(start_date))::int
      FROM health_records
      WHERE record_type = ${m.type} AND value IS NOT NULL
    `);
  }

  const result = await db.execute(
    sql`SELECT COUNT(*) as cnt FROM personal_baselines`
  );
  console.log(
    `  Created ${(result as any)[0]?.cnt || "unknown"} personal baseline records`
  );
}

importHealthData()
  .catch(console.error)
  .finally(() => process.exit(0));
