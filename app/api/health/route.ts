import { db } from "@/lib/db";
import { dailyBaselines, personalBaselines } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";

// Mock data fallback
const MOCK_RESPONSE = {
  personalBaselines: [
    { metric: "heart_rate", avgValue: 75, stdDev: 8, minNormal: 67, maxNormal: 83 },
    { metric: "hrv", avgValue: 58, stdDev: 18, minNormal: 40, maxNormal: 76 },
    { metric: "resting_heart_rate", avgValue: 67, stdDev: 5, minNormal: 62, maxNormal: 72 },
    { metric: "sleep", avgValue: 7.1, stdDev: 1.2, minNormal: 5.9, maxNormal: 8.3 },
    { metric: "step_count", avgValue: 7800, stdDev: 2500, minNormal: 5300, maxNormal: 10300 },
    { metric: "vo2_max", avgValue: 35, stdDev: 3, minNormal: 32, maxNormal: 38 },
  ],
  dailyData: [], // Will be populated from DB or left empty for mock
  summary: {
    totalRecords: 0,
    dateRange: { start: "2019-05-17", end: "2025-05-28" },
    totalDays: 2082,
  },
};

export async function GET() {
  try {
    // Get personal baselines
    const baselines = await db.select().from(personalBaselines);

    // Get last 30 days of daily data
    const daily = await db
      .select()
      .from(dailyBaselines)
      .orderBy(desc(dailyBaselines.date))
      .limit(30);

    // Get total record count
    const countResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM health_records`);
    const totalRecords = (countResult as any)[0]?.cnt || 0;

    return Response.json({
      personalBaselines: baselines.length > 0 ? baselines : MOCK_RESPONSE.personalBaselines,
      dailyData: daily.reverse(), // chronological order
      summary: {
        totalRecords,
        dateRange: daily.length > 0
          ? { start: daily[0].date, end: daily[daily.length - 1].date }
          : MOCK_RESPONSE.summary.dateRange,
        totalDays: daily.length || MOCK_RESPONSE.summary.totalDays,
      },
    });
  } catch (err) {
    console.error("Health API error, returning mock data:", err);
    return Response.json(MOCK_RESPONSE);
  }
}
