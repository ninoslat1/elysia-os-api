import { mysqlTable, int, varchar, tinyint, datetime } from "drizzle-orm/mysql-core";

export const locationTable = mysqlTable("config", {
  id: int("ID").autoincrement().primaryKey(),

  name: varchar("Name", { length: 75 }).notNull(),

  address1: varchar("Address1", { length: 50 }),

  address2: varchar("Address2", { length: 50 }),

  androidPort: int("AndroidPort").notNull().default(8080),

  hppcPort: int("HppcPort").notNull().default(8181),
  lotPayment: tinyint("LotPayment").notNull().default(0),

  lotClosing: tinyint("LotClosing").notNull().default(0),

  userId: int("UserID").notNull().default(0),

  customerId: int("CustomerID"),

  liveDate: datetime("LiveDate"),

  picId: int("PICID"),

  uid: varchar("UID", { length: 50 }),

  code: varchar("Code", { length: 50 }),
  videoUrl: varchar("VideoURL", { length: 50 }),
});
