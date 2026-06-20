import { dbMst } from "../db";
import { locationTable } from "../db/schemas/location";
import { eq } from "drizzle-orm";
import type { FindLocationByIdDTO } from "../types/location";

export class LocationRepository {
  async findLocationByAreaId(
    dto: FindLocationByIdDTO,
  ): Promise<typeof locationTable.$inferSelect | null> {
    const { id } = dto;

    try {
      const [result] = await dbMst
        .select()
        .from(locationTable)
        .where(eq(locationTable.id, id))
        .limit(1);

      return result ?? null;
    } catch (error) {
      console.error("[LocationRepository] [findLocationByAreaUid]", { id, error });
      return null;
    }
  }
}
