import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/trace";

const client = postgres(connectionString, { max: 1, ssl: "require" });
export const db = drizzle(client, { schema });
