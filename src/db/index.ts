import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { areaTable } from "./schemas/area";
import { locationTable } from "./schemas/location";
import { env } from "../env";

const mstPoolConnection = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASS,
  port: Number.parseInt(env.DB_PORT ?? "3306"),
  database: env.DB_MST,
});

export const dbMst = drizzle(mstPoolConnection, {
  schema: { areaTable, locationTable },
  mode: "default",
});
