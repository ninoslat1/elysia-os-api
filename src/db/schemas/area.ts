import { mysqlTable, int, varchar, decimal } from "drizzle-orm/mysql-core";

export const areaTable = mysqlTable("area", {
  id: int("ID").autoincrement().primaryKey(),

  remark: varchar("Remark", { length: 45 }),

  space: int("Space").notNull().default(0),

  status: int("Status").notNull().default(0),

  posInType: int("PosInType").notNull().default(0),

  posOutType: int("PosOutType").notNull().default(0),

  defaultClassId: int("DefaultClassID").notNull().default(-1),

  fixClassId: int("FixClassID").notNull().default(0),

  userId: int("UserID").notNull().default(0),

  locationId: int("LocationID"),

  uid: varchar("UID", { length: 50 }),

  target: decimal("Target", {
    precision: 20,
    scale: 6,
  }),
});
